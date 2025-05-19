export async function load({ fetch }) {
  const res = await fetch('https://my-json-server.typicode.com/rboukhemia/dataDailyUsage/dailyUsages');
  const allData = await res.json();

  if (!res.ok) {
    throw new Error('Could not fetch the data');
  }

  return {
    allData
  };
}
