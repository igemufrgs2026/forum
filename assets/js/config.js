// Public configuration only. Never put passwords or private keys here.
const CONFIG = Object.freeze({
    apiUrl: "https://script.google.com/macros/s/AKfycbz9bWBYfVVIfD2VlM4Ii69xs21s9JfeXR2Ihi8w3bQFsWMfm6oy6NzbKRREvsSFymo/exec",
    demo: new URLSearchParams(location.search).get('demo') === '1',
    timeoutMs: 15000
});
