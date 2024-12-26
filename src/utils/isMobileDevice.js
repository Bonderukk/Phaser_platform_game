export function isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /Mobi|Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry|Opera Mini/i.test(userAgent);
}