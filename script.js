(() => {
  'use strict';

  const screens = {
    today: {
      label: 'Today', title: ['Your day,', 'at a glance.'],
      description: 'Calories, macros, water, and your latest meals. A clear place to start.',
      alt: 'Today overview with a calorie ring, macros, water and recent meals',
      detail: ['food-search', 'Food search', 'Explore food search'],
    },
    log: {
      label: 'Log', title: ['Your meals.', 'Always editable.'],
      description: 'Find your food, choose a portion, and adjust an entry whenever you need to.',
      alt: 'Food log with daily nutrition totals and editable meal entries',
      detail: ['food-portions', 'Food portions', 'See portions and nutrition'],
    },
    meals: {
      label: 'Meals', title: ['Start with', 'what you have.'],
      description: 'Find published recipes that match your fridge. See what’s missing and where each idea comes from.',
      alt: 'Meals page with cooking, eating out and ready-made food options',
      detail: ['meal-suggestions', 'Meal suggestions', 'Explore meal suggestions'],
    },
    progress: {
      label: 'Progress', title: ['See your routine', 'take shape.'],
      description: 'Logging streaks, connected weigh-ins, and a weekly check-in to reflect on your progress.',
      alt: 'Progress page showing logged days, achievements and weight history',
      detail: ['check-in', 'Weekly check-in', 'Look inside a check-in'],
    },
    community: {
      label: 'Community', title: ['A little company', 'along the way.'],
      description: 'Share meals and moments with chosen friends, with your health details kept private.',
      alt: 'Community feed showing sample food posts shared with friends',
      detail: ['profile', 'Your profile', 'Take a look at your profile'],
    },
    profile: {
      label: 'Profile', title: ['Your space.', 'Your pace.'],
      description: 'Your handle, your posts, and a private overview of your routine.',
      alt: 'Personal profile with a handle, logging streak and private health overview',
      detail: ['community', 'Community', 'See the community feed'],
    },
  };

  let currentScreen = 'today';
  let currentTheme = 'dark';
  const tabs = Array.from(document.querySelectorAll('[data-screen]'));
  const themeButtons = document.querySelectorAll('[data-theme]');
  const panel = document.querySelector('#screen-panel');
  const image = document.querySelector('#screen-image');
  const preview = document.querySelector('.screen-preview');
  const title = document.querySelector('#screen-title');
  const description = document.querySelector('#screen-description');
  const detail = document.querySelector('#screen-detail');
  const status = document.querySelector('#screen-status');
  const dialog = document.querySelector('#screen-dialog');
  const dialogTitle = document.querySelector('#dialog-title');
  const dialogImage = document.querySelector('#dialog-image');
  const dialogCaption = document.querySelector('#dialog-caption');
  let dialogOpener;

  function screenPath(name, theme = currentTheme) {
    return `screenshots/${name}-${theme}.png?v=20260927`;
  }

  function render() {
    const screen = screens[currentScreen];
    tabs.forEach(tab => {
      const selected = tab.dataset.screen === currentScreen;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    themeButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.theme === currentTheme));
    });
    panel.setAttribute('aria-labelledby', `tab-${currentScreen}`);
    title.replaceChildren(document.createTextNode(`${screen.title[0]} `), document.createElement('br'), document.createTextNode(screen.title[1]));
    description.textContent = screen.description;
    image.src = screenPath(currentScreen);
    image.alt = screen.alt;
    preview.href = screenPath(currentScreen);
    preview.setAttribute('aria-label', `Enlarge ${screen.label} screenshot`);
    // Detail captures are dark-only, except the profile and community screens.
    const detailTheme = screens[screen.detail[0]] ? currentTheme : 'dark';
    detail.href = screenPath(screen.detail[0], detailTheme);
    detail.dataset.title = screen.detail[1];
    detail.firstChild.textContent = `${screen.detail[2]} `;
    status.textContent = `${screen.label} screenshot, ${currentTheme} appearance.`;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (currentScreen === tab.dataset.screen) return;
      currentScreen = tab.dataset.screen;
      render();
    });
    tab.addEventListener('keydown', event => {
      const index = tabs.indexOf(tab);
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      currentScreen = tabs[next].dataset.screen;
      render();
      tabs[next].focus();
    });
  });

  themeButtons.forEach(button => button.addEventListener('click', () => {
    if (currentTheme === button.dataset.theme) return;
    currentTheme = button.dataset.theme;
    render();
  }));

  function openScreenshot(event, source, heading, alt, widget = false) {
    // Keep direct image links usable if a browser doesn't support dialogs.
    if (typeof dialog.showModal !== 'function') return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    dialogOpener = event.currentTarget;
    dialogTitle.textContent = heading;
    dialogImage.src = source;
    dialogImage.alt = alt;
    dialogCaption.textContent = widget
      ? 'Native Android test render with sample data.'
      : 'Actual app screen with sample data.';
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }

  preview.addEventListener('click', event => {
    const screen = screens[currentScreen];
    openScreenshot(event, preview.href, `${screen.label} · ${currentTheme}`, screen.alt);
  });
  detail.addEventListener('click', event => {
    openScreenshot(event, detail.href, detail.dataset.title, `${detail.dataset.title} in the NutriGo app`);
  });
  document.querySelectorAll('.widget-preview').forEach(link => {
    link.addEventListener('click', event => {
      openScreenshot(event, link.href, link.dataset.title, link.querySelector('img').alt, true);
    });
  });
  const closeButton = document.querySelector('.close-dialog');
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    // The close button is this image dialog’s only interactive control.
    if (event.key !== 'Tab') return;
    event.preventDefault();
    closeButton.focus();
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    dialogOpener?.focus({ preventScroll: true });
  });

  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', 'tab-today');
  document.querySelector('.screen-tabs').hidden = false;
  document.querySelector('.appearance').hidden = false;
})();
