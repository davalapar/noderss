const errors = require('../utils/errors');
const RSS = require('../proxies/rss-feed');
const i18n = require('../i18n');

module.exports = async (ctx, next) => {
    const { lang } = ctx.state;
    const { text } = ctx.message;
    const [command, url] = text.split(/\s+/);
    if (!url) {
        switch (command.substr(0, 4)) {
            case '/sub':
                throw errors.newCtrlErr('SUB_USAGE');
            case '/uns':
                if (command.substr(0, 8) === '/unsubthis') {
                    throw errors.newCtrlErr('UNSUB_USAGE');
                } else {
                    const feeds = await RSS.getSubscribedFeedsByUserId(
                        ctx.state.chat.id
                    );
                    await ctx.reply(i18n[lang]['CHOOSE_UNSUB'], {
                        reply_markup: {
                            keyboard: feeds.map((i) => {
                                return [`[${i.feed_id}] ${i.feed_title}`];
                            }),
                            one_time_keyboard: true
                        }
                    });
                }
                return; // this ctx end wait for another message from keyboard
            case '/exp':
                throw errors.newCtrlErr('EXPORT');
            case '/all':
                throw errors.newCtrlErr('USB_ALL_USAGE');
            case '/vie':
                throw errors.newCtrlErr('VIEW_ALL_USAGE');
        }
    } else if (!url.startsWith('http') && !url.startsWith('https')) {
        throw errors.newCtrlErr('FEED_URL_NOT_PARSE');
    }
    ctx.state.feedUrl = decodeURI(url);
    await next();
};
