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
}
