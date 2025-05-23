import { writable } from 'svelte/store';
import { contactsArrivedStore, contactsStore, errorLocation, newLocation } from './functions';


const connectedId = writable([])
// Store to hold WebSocket connections and their states
function createWebSocketStore() {
  const { subscribe, update } = writable({});

  // Initialize WebSocket for a single kid
  function connectWebSocket(childId) {
    const access = localStorage.getItem("access") || sessionStorage.getItem("access");
    const wsUrl =`ws://127.0.0.1:8000/ws/general/${childId}/?token=${access}`
      
    const ws = new WebSocket(wsUrl);
     connectedId.update(currentIds => {
        if (!currentIds.includes(childId)) {
        return [...currentIds, childId];
        }
        return currentIds;
    });

    update((store) => ({
      ...store,
      [childId]: {
        ws,
        status: 'connecting',
        messages: [], // General messages
        notifications: [],
        badWords: [],
        schedules: [],
        phoneLocked: null,
        pin: null,
        contacts: [],
        chats: [],
        errors: []
      }
    }));

    ws.onopen = () => {
      update((store) => ({
        ...store,
        [childId]: { ...store[childId], status: 'connected' }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const messageType = data.type;

        update((store) => {
          const childStore = { ...store[childId] };
          switch (messageType) {
            case 'NOTIFICATION':
              childStore.notifications = [...childStore.notifications, data.notification];
              break;
            case 'LOCATION':
              newLocation.set(data.location)
              //childStore.locations = [...childStore.locations, ];
              break;
            case 'LOCATION_ERROR':
              errorLocation.set(data.error)
              //childStore.errors = [...childStore.errors, data.error];
              break;
            case 'BAD_WORDS':
              childStore.badWords = data.bad_words;
              break;
            case 'SCHEDULE':
              childStore.schedules = data.schedules;
              break;
            case 'LOCK_PHONE':
              childStore.phoneLocked = data.phone_locked;
              break;
            case 'PIN_CHANGE':
              childStore.pin = data.new_pin;
              break;
           case 'RESPONSE_CONTACT':
                try {
                    // Validate data.contacts exists
                    if (!data.contacts || typeof data.contacts !== 'string') {
                        console.error('Invalid or missing contacts data');
                        return;
                    }

                    // Handle potential double-stringification
                    let parsedContacts = JSON.parse(data.contacts);
                    parsedContacts= JSON.parse(new Array(parsedContacts)[0])
                    contactsStore.set(parsedContacts);
                    contactsArrivedStore.set(true);
                } catch (error) {
                    console.error('Error processing contacts:', error.message);
                }
                break;
            
            case 'RESPONSE_CURRENT_CHATS':
              childStore.chats = data.contacts;
              break;
            case 'RESPONSE_CHAT':
              childStore.chats = [...childStore.chats, ...data.chats];
              break;
            case 'ERROR':
              childStore.errors = [...childStore.errors, data.message];
              break;
            case 'CONFIRM_PIN':
            case 'CONFIRM_BAD_WORDS':
            case 'CONFIRM_LOCK_PHONE':
            case 'RESPONSE_BLOCK_CHAT':
            case 'ADD_SCHEDULE':
            case 'DELETE_SCHEDULE':
              childStore.messages = [...childStore.messages, data];
              break;
            default:
              childStore.messages = [...childStore.messages, data];
          }
          return { ...store, [childId]: childStore };
        });
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      update((store) => ({
        ...store,
        [childId]: { ...store[childId], status: 'disconnected' }
      }));
    };

    ws.onerror = (error) => {
      update((store) => ({
        ...store,
        [childId]: {
          ...store[childId],
          status: 'error',
          errors: [...store[childId].errors, `WebSocket error: ${error}`]
        }
      }));
    };

    return ws;
  }

  // Initialize WebSockets for a list of kids
  function initializeWebSockets(childIds) {
    let idsToConnect =[]
  const unsubscribe = connectedId.subscribe((connectedIds) => {
    idsToConnect = childIds.filter(id => id && !connectedIds.includes(id));
  });
    idsToConnect.forEach((childId) => {
        connectWebSocket(childId);
    });
}

  // Send a message to a specific kid's WebSocket
  function sendMessage(childId, message) {
    update((store) => {
      if (store[childId]?.ws?.readyState === WebSocket.OPEN) {
        store[childId].ws.send(JSON.stringify(message));
      }
      return store;
    });
  }



  function changePin(childId, newPin) {
    sendMessage(childId, { type: 'PIN_CHANGE', new_pin: newPin });
  }

  function confirmPin(childId) {
    sendMessage(childId, { type: 'CONFIRM_PIN' });
  }

  function getLocation(childId) {
    sendMessage(childId, { type: 'GET_LOCATION' });
  }

  function sendLocation(childId, location) {
    sendMessage(childId, { type: 'LOCATION', location });
  }

  function sendLocationError(childId, error) {
    sendMessage(childId, { type: 'LOCATION_ERROR', error });
  }

  function sendBadWords(childId) {
    sendMessage(childId, { type: 'BAD_WORDS' });
  }

  function confirmBadWords(childId) {
    sendMessage(childId, { type: 'CONFIRM_BAD_WORDS' });
  }

  function lockPhone(childId) {
    sendMessage(childId, { type: 'LOCK_PHONE' });
  }

  function confirmLockPhone(childId) {
    sendMessage(childId, { type: 'CONFIRM_LOCK_PHONE' });
  }

  function getSchedules(childId) {
    sendMessage(childId, { type: 'SCHEDULE' });
  }
  
  function addSchedule(childId, id) {
    sendMessage(childId, { type: 'ADD_SCHEDULE', id });
  }

  function deleteSchedule(childId, id) {
    sendMessage(childId, { type: 'DELETE_SCHEDULE', id });
  }


  function requestContact(childId) {
    sendMessage(childId, { type: 'REQUEST_CONTACT' });
  }

  function responseContact(childId, contacts) {
    sendMessage(childId, { type: 'RESPONSE_CONTACT', contacts });
  }

  function requestCurrentChats(childId) {
    sendMessage(childId, { type: 'REQUEST_CURRENT_CHATS' });
  }

  function responseCurrentChats(childId, contacts) {
    sendMessage(childId, { type: 'RESPONSE_CURRENT_CHATS', contacts });
  }

  function requestBlockChat(childId, name) {
    sendMessage(childId, { type: 'REQUEST_BLOCK_CHAT', name });
  }

  function responseBlockChat(childId) {
    sendMessage(childId, { type: 'RESPONSE_BLOCK_CHAT' });
  }

  function requestChat(childId, name) {
    sendMessage(childId, { type: 'REQUEST_CHAT', name });
  }

  function responseChat(childId, chats) {
    sendMessage(childId, { type: 'RESPONSE_CHAT', chats });
  }

  function requestSelect(childId, name) {
    sendMessage(childId, { type: 'REQUEST_SELECT', name });
  }

  // Close all WebSocket connections
  function closeAll() {
    update((store) => {
      Object.values(store).forEach((conn) => {
        if (conn.ws?.readyState === WebSocket.OPEN) {
          conn.ws.close();
        }
      });
      return {};
    });
  }

  return {
    subscribe,
    initializeWebSockets,
    changePin,
    confirmPin,
    getLocation,
    sendLocation,
    sendLocationError,
    sendBadWords,
    confirmBadWords,
    lockPhone,
    confirmLockPhone,
    getSchedules,
    addSchedule,
    deleteSchedule,
    requestContact,
    responseContact,
    requestCurrentChats,
    responseCurrentChats,
    requestBlockChat,
    responseBlockChat,
    requestChat,
    responseChat,
    requestSelect,
    closeAll
  };
}

export const websocketStore = createWebSocketStore();