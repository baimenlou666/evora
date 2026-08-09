document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#filtered-cbox-form');
  const list = document.querySelector('#filtered-cbox-messages');
  const sendLink = document.querySelector('.filtered-cbox-send-link');

  if (!form || !list || !sendLink) return;

  sendLink.addEventListener('click', () => {
    const name = form.elements.name.value.trim();
    const message = form.elements.message.value.trim();

    if (!name || !message) return;

    const item = document.createElement('article');
    item.className = 'filtered-cbox-message';

    const avatar = document.createElement('span');
    avatar.className = 'filtered-cbox-avatar filtered-cbox-avatar-empty';

    const time = document.createElement('time');
    time.dateTime = new Date().toISOString();
    time.textContent = 'just now';

    const author = document.createElement('strong');
    author.textContent = name;

    const body = document.createElement('p');
    body.textContent = message;

    item.append(avatar, time, author, body);
    list.append(item);
    form.elements.message.value = '';
    list.scrollTop = list.scrollHeight;
  });
});
