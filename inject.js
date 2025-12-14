// this is the code which will be injected into a given page...

(function(){

    let re = new RegExp();
    let match = "";
    let page = document.documentElement.innerHTML;
    chrome.runtime.sendMessage({"pageBody": page, "origin":window.origin, "parentUrl": window.location.href, "parentOrigin": window.origin});

    //chrome.browserAction.setBadgeText({text: 'ON'});




    setTimeout(function(){
         for (scriptIndex in document.scripts) {
            if (document.scripts[scriptIndex].src){
                let scriptSRC = document.scripts[scriptIndex].src;
                if (scriptSRC.startsWith("//")){
                    scriptSRC = location.protocol + scriptSRC
                }
                chrome.runtime.sendMessage({"scriptUrl": scriptSRC, "parentUrl": window.location.href, "parentOrigin": window.origin});
            }

        }
    },2000)
    let origin = window.location.origin;
    let originalPath = window.location.pathname;
    let newPath = originalPath.substr(0, originalPath.lastIndexOf("/"));
    let newHref = origin + newPath;
    let envUrl = newHref + "/.env";
    chrome.runtime.sendMessage({"envFile": envUrl,"parentUrl": window.location.href, "parentOrigin": window.origin});
    let gitUrl = newHref + "/.git/config";
    chrome.runtime.sendMessage({"gitDir": gitUrl, "parentUrl": window.location.href, "parentOrigin": window.origin});
})()

// Listen for messages from the extension to show a non-intrusive modal
if (!window.__trufflehog_modal_installed) {
    window.__trufflehog_modal_installed = true;

    // Create a container to hold stacked modals
    const ensureContainer = () => {
        let container = document.getElementById('trufflehog-modal-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'trufflehog-modal-container';
            container.style.position = 'fixed';
            container.style.bottom = '20px';
            container.style.left = '20px';
            container.style.zIndex = '2147483647';
            container.style.display = 'flex';
            container.style.flexDirection = 'column-reverse';
            container.style.gap = '8px';
            document.documentElement.appendChild(container);
        }
        return container;
    };

    // Close topmost modal on Escape
    const escHandler = (e) => {
        if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
            const container = document.getElementById('trufflehog-modal-container');
            if (container && container.lastElementChild) {
                container.removeChild(container.lastElementChild);
            }
        }
    };

    window.addEventListener('keydown', escHandler, true);

    const createModal = (message, srcUrl) => {
        const container = ensureContainer();

        const modal = document.createElement('div');
        modal.setAttribute('role','dialog');
        modal.style.maxWidth = '380px';
        modal.style.minWidth = '220px';
        modal.style.background = 'linear-gradient(135deg,#fff8e1,#ffe0b2)';
        modal.style.color = '#222';
        modal.style.padding = '12px 14px 12px 14px';
        modal.style.borderRadius = '10px';
        modal.style.boxShadow = '0 10px 26px rgba(0,0,0,0.25)';
        modal.style.fontFamily = 'Arial, Helvetica, sans-serif';
        modal.style.fontSize = '13px';
        modal.style.lineHeight = '1.3';
        modal.style.position = 'relative';
        modal.style.cursor = 'default';
        modal.style.borderLeft = '6px solid #ff6f61';
        modal.style.overflowWrap = 'anywhere';

        // enter animation
        modal.style.opacity = '0';
        modal.style.transform = 'translateY(10px) scale(0.99)';
        modal.style.transition = 'opacity 220ms ease, transform 220ms cubic-bezier(.2,.9,.3,1)';

        const closeBtn = document.createElement('button');
        closeBtn.innerText = '×';
        closeBtn.setAttribute('aria-label','Close Trufflehog alert');
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '6px';
        closeBtn.style.right = '8px';
        closeBtn.style.background = 'transparent';
        closeBtn.style.color = '#444';
        closeBtn.style.border = 'none';
        closeBtn.style.fontSize = '16px';
        closeBtn.style.cursor = 'pointer';

        const openBtn = document.createElement('button');
        openBtn.innerText = '🔗';
        openBtn.title = 'Open source URL';
        openBtn.setAttribute('aria-label','Open finding URL');
        openBtn.style.position = 'absolute';
        openBtn.style.top = '6px';
        openBtn.style.right = '64px';
        openBtn.style.background = 'transparent';
        openBtn.style.color = '#444';
        openBtn.style.border = 'none';
        openBtn.style.fontSize = '14px';
        openBtn.style.cursor = 'pointer';

        const copyBtn = document.createElement('button');
        copyBtn.innerText = '📋';
        copyBtn.title = 'Copy finding text';
        copyBtn.setAttribute('aria-label','Copy finding');
        copyBtn.style.position = 'absolute';
        copyBtn.style.top = '6px';
        copyBtn.style.right = '36px';
        copyBtn.style.background = 'transparent';
        copyBtn.style.color = '#444';
        copyBtn.style.border = 'none';
        copyBtn.style.fontSize = '14px';
        copyBtn.style.cursor = 'pointer';

        const textDiv = document.createElement('div');
        textDiv.className = 'trufflehog-modal-text';
        textDiv.innerText = message;
        textDiv.style.paddingRight = '48px';

        closeBtn.addEventListener('click', () => {
            if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
        });

        const showCopyFeedback = (btn) => {
            const orig = btn.innerText;
            btn.innerText = 'Copied';
            setTimeout(() => { try{ btn.innerText = orig }catch(e){} }, 1200);
        };

        copyBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const text = textDiv.innerText || '';
            if (navigator.clipboard && navigator.clipboard.writeText){
                navigator.clipboard.writeText(text).then(() => showCopyFeedback(copyBtn)).catch(() => showCopyFeedback(copyBtn));
            } else {
                // fallback
                try{
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    showCopyFeedback(copyBtn);
                }catch(e){ showCopyFeedback(copyBtn) }
            }
        });

        openBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const urlToOpen = srcUrl || (String(textDiv.innerText).match(/https?:\/\/[^\s'"<>]+/)||[])[0];
            if (urlToOpen){
                try{
                    window.open(urlToOpen, '_blank');
                }catch(e){
                    // fallback: send a message to background to open
                    try{ chrome.runtime.sendMessage({trufflehog_open_url: urlToOpen}); }catch(e){}
                }
            }
        });

        modal.appendChild(openBtn);
        modal.appendChild(copyBtn);
        modal.appendChild(closeBtn);
        modal.appendChild(textDiv);

        // append as last child so stacking appears upwards
        container.appendChild(modal);

        // trigger entrance
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.style.transform = 'translateY(0) scale(1)';
        });
    };

    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
        if (msg && msg.trufflehog_show_modal){
            try{
                createModal(msg.trufflehog_show_modal, msg.trufflehog_src_url);
            }catch(e){console.error('trufflehog modal error', e)}
        } else if (msg && msg.trufflehog_open_url){
            // background requested open (fallback)
            try{ window.open(msg.trufflehog_open_url, '_blank'); }catch(e){}
        }
    });
}

