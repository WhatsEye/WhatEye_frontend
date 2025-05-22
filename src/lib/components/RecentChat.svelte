<script>
    export let isActive = false;
</script>

<div class="row divider m-0 border"></div>
<li class="nav-item">
    <button type="button" class="dropdown-item {isActive ? "active" : ""}">
        <!-- TODO: add class active for selected discussion -->
        <div class="widget-content p-0">
            <div class="widget-content-wrapper">
                <div class="widget-content-left me-3">
                    <div class="avatar-icon-wrapper">
                        <div class="avatar-icon">
                            <img src="https://placehold.co/150x150/EFEFEF/AAAAAA&text=Photo" alt="">
                        </div>
                    </div>
                </div>
                <div class="widget-content-left">
                    <div class="widget-heading">Group name / Contact name</div>
                    <div class="widget-subheading">Last msg ?</div>
                </div>
            </div>
        </div>
    </button>
</li>
<div class="row divider m-0 border"></div>