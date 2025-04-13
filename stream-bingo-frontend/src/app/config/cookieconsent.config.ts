import { NgcCookieConsentConfig } from 'ngx-cookieconsent'

export const cookieConfig: NgcCookieConsentConfig = {
    cookie: {
        domain: 'localhost'
    },
    palette: {
        popup: {
            background: '#fff',
        },
        button: {
            background: 'var(--main-color)',
        },
        highlight: {
            background: 'var(--secondary-color)',
            text: 'black',
        }
    },
    position: 'bottom-right',
    theme: 'classic',
    type: 'opt-out',
    layout: '"basic-close',
    revokable: true,
    location: true,
    law: {
        regionalLaw: false,
    },
    content: {
        "message": "Ce site web utilise des cookies pour vous assurer la meilleure expérience de navigation sur notre site.",
        "dismiss": "OK, j'ai compris!",
        "deny": "Refuser",
        "link": "Plus d'information",
        "href": "https://cookiesandyou.com",
        "policy": "Cookie Policy",
        "header": "Cookies sur le site!",
        "allow": "Autoriser les cookies"
    }
}
