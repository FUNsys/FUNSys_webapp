var isOpening = false;

function openModalOverlay(onClickOverlay) {
    if (isOpening) {
        return false;
    }
    var overlay = document.createElement("div");
    overlay.id = 'modal-overlay';
    overlay.style.display = "block";
    if (onClickOverlay != null) {
        overlay.onclick = onClickOverlay;
    }
    document.body.appendChild(overlay);
    isOpening = true;
    return true;
}

function closeModalOverlay() {
    if (!isOpening) {
        return false;
    }
    var overlay = document.getElementById("modal-overlay");
    document.body.removeChild(overlay);
    isOpening = false;
    return true;
}

function getModalStatus() {
    return isOpening;
}
