document.addEventListener('DOMContentLoaded', () => {
    const Login = document.getElementById('Login');
    const HomePage = document.getElementById('HomePage');
    const GifterLevel = document.getElementById('GifterLevel');
    const HeartMeLevel = document.getElementById('HeartMeLevel');
    const Terms = document.getElementById('Terms');

    const Superfan_Terms = document.getElementById('Superfan_Terms');


    if (Superfan_Terms) {
        Superfan_Terms.addEventListener('click', () => {
            window.open('https://www.tiktok.com/live/monetization/fan-club/anchor/sub-announcement-ls?lang=ja-JP');
        });
    }

    if (Login) {
        Login.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }

    if (HomePage) {
        HomePage.addEventListener('click', () => {
            window.location.href = 'https://sites.google.com/view/gobou-tiktok/%E3%83%9B%E3%83%BC%E3%83%A0';
        });
    }

    if (GifterLevel) {
        GifterLevel.addEventListener('click', () => {
            alert('準備中です！');
        });
    }

    if (HeartMeLevel) {
        HeartMeLevel.addEventListener('click', () => {
            alert('準備中です！');
        });
    }

    if (Terms) {
        Terms.addEventListener('click', () => {
            window.location.href = 'terms.html';
        });
    }
});