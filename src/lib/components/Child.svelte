<div class="card shadow-lg mb-3 p-3 rounded">
    <div class="d-flex flex-column flex-sm-row align-items-center">
        <!-- svelte-ignore a11y_img_redundant_alt -->
        <img src="https://placehold.co/80x80/DBEAFE/3B82F6?text=Child1" alt="Child's Profile Picture" class="child-img rounded-circle me-0 me-sm-3 mb-3 mb-sm-0 border border-4 border-blue-200">
        <div class="flex-grow-1 text-center text-sm-start">
            <h4 class="h6 fw-bolder text-dark">//TODO: Name</h4>
            <p class="text-blue-600 small mb-1">//TODO: </p>
            <p class="small text-muted mt-1">//TODO: </p>
        </div>
        <div class="mt-3 mt-sm-0 ms-sm-auto d-flex flex-column flex-sm-row">
            <button class="btn btn-primary btn-sm fw-medium py-1 px-2 rounded d-flex align-items-center justify-content-center mb-2 mb-sm-0 me-sm-2">
                View Activity
            </button>
            <button class="btn btn-light btn-sm fw-medium py-1 px-2 rounded d-flex align-items-center justify-content-center border">
                Settings
            </button>
        </div>
    </div>
</div>

<div class="mb-3 card p-3 rounded-3">
    <div class="d-flex flex-column flex-sm-row align-items-center">
        <!-- svelte-ignore a11y_img_redundant_alt -->
        <img src="https://placehold.co/80x80/FEE2E2/DC2626?text=Child2" alt="Child's Profile Picture" class="child-img rounded-circle me-0 me-sm-3 mb-3 mb-sm-0 border border-4 border-red-200">
        <div class="flex-grow-1 text-center text-sm-start">
            <h4 class="h6 fw-bolder text-dark">Girl</h4>
            <p class="text-red-600 fw-medium small mb-1">text</p>
             <p class="small text-muted mt-1">text</p>
        </div>
        <div class="mt-3 mt-sm-0 ms-sm-auto d-flex flex-column flex-sm-row">
            <button class="btn btn-primary btn-sm fw-medium py-1 px-2 rounded d-flex align-items-center justify-content-center mb-2 mb-sm-0 me-sm-2">
                View Activity
            </button>
            <button class="btn btn-light btn-sm fw-medium py-1 px-2 rounded d-flex align-items-center justify-content-center border">
                Settings
            </button>
        </div>
    </div>
</div>

<style>
    .child-img {
        width: 80px;
        height: 80px;
    }
    .text-blue-600 { color: #2563eb !important; }
    .text-red-600 { color: #dc2626 !important; }
    .border-blue-200 { border-color: #bfdbfe !important; }
    .border-red-200 { border-color: #fecaca !important; }
</style>