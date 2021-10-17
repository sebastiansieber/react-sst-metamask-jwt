export function setLocalUser(jwt) {
    localStorage.setItem('currentUser', jwt);
}

export function isLocalUser() {
    if (localStorage.getItem('currentUser'))
        return true;
    else
        return false;
}

export function removeLocalUser() {
    localStorage.removeItem('currentUser');
}
