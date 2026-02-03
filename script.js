// Tic-Tac-Toe with keyboard support + enhanced visual feedback.
// If you change non-trivial logic manually, note it in the interaction log (lab requirement).

(() => {
  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('statusText');
  const hintEl = document.getElementById('hintText');
  const restartBtn = document.getElementById('restartBtn');
  const themeBtn = document.getElementById('themeBtn');

  const WIN_LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];

  let state = {
    board: Array(9).fill(null),
    current: 'X',
    winner: null,
    draw: false,
    focusIndex: 0,
    theme: 'light'
  };

  function init() {
    // Set initial theme
    const storedTheme = localStorage.getItem('ttt_theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      state.theme = storedTheme;
    } else {
      state.theme = 'light';
    }
    applyTheme();

    // Build cells
    boardEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.type = 'button';
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('data-idx', String(i));
      cell.setAttribute('aria-label', `Cell ${i+1}`);
      cell.addEventListener('click', () => makeMove(i));
      boardEl.appendChild(cell);
    }

    restartBtn.addEventListener('click', resetGame);
    themeBtn.addEventListener('click', toggleTheme);

    // Keyboard controls
    document.addEventListener('keydown', onKeyDown);

    // Start
    resetGame(false);
  }

  function resetGame(focus = true) {
    state.board = Array(9).fill(null);
    state.current = 'X';
    state.winner = null;
    state.draw = false;
    state.focusIndex = 0;
    render();

    if (focus) focusCell(0);
    announce(`Player X’s turn`);
  }

  function getWinner(board) {
    for (const line of WIN_LINES) {
      const [a,b,c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { mark: board[a], line };
      }
    }
    return null;
  }

  function makeMove(i) {
    if (state.winner || state.draw) return;
    if (state.board[i]) return;

    state.board[i] = state.current;

    const win = getWinner(state.board);
    if (win) {
      state.winner = win.mark;
      render(win.line);
      announce(`Player ${win.mark} wins! Press Restart to play again.`);
      return;
    }

    if (state.board.every(Boolean)) {
      state.draw = true;
      render();
      announce(`It’s a draw. Press Restart to play again.`);
      return;
    }

    state.current = state.current === 'X' ? 'O' : 'X';
    render();
    announce(`Player ${state.current}’s turn`);
  }

  function render(winLine = null) {
    const cells = boardEl.querySelectorAll('.cell');

    cells.forEach((cell, i) => {
      cell.classList.remove('win');
      cell.setAttribute('aria-disabled', String(Boolean(state.board[i]) || state.winner || state.draw));

      // clear
      cell.textContent = '';
      const mark = state.board[i];
      if (mark) {
        const span = document.createElement('span');
        span.textContent = mark;
        span.className = mark === 'X' ? 'markX' : 'markO';
        cell.appendChild(span);
      }
    });

    if (winLine) {
      for (const idx of winLine) {
        cells[idx].classList.add('win');
      }
    }

    // status line
    if (state.winner) {
      statusEl.textContent = `Player ${state.winner} wins!`;
      hintEl.textContent = `Restart to play again • Keyboard: R to restart`;
    } else if (state.draw) {
      statusEl.textContent = `Draw game.`;
      hintEl.textContent = `Restart to play again • Keyboard: R to restart`;
    } else {
      statusEl.textContent = `Player ${state.current}’s turn`;
      hintEl.textContent = `Mouse/tap to play • Keyboard: Arrow keys to move, Enter/Space to place`;
    }
  }

  function announce(text) {
    // aria-live will speak this; keep it short and clear
    statusEl.textContent = text;
    // Keep hint stable if game ended
    if (state.winner || state.draw) return;
    hintEl.textContent = `Mouse/tap to play • Keyboard: Arrow keys to move, Enter/Space to place`;
  }

  function onKeyDown(e) {
    const key = e.key.toLowerCase();

    // global shortcuts
    if (key === 'r') { resetGame(); return; }
    if (key === 't') { toggleTheme(); return; }

    // ignore navigation if focus isn't on a cell (still allow)
    if (['arrowup','arrowdown','arrowleft','arrowright','enter',' '].includes(key)) {
      e.preventDefault();
    }

    if (key === 'enter' || key === ' ') {
      makeMove(state.focusIndex);
      return;
    }

    const row = Math.floor(state.focusIndex / 3);
    const col = state.focusIndex % 3;

    let next = state.focusIndex;
    if (key === 'arrowup')    next = ((row + 2) % 3) * 3 + col;
    if (key === 'arrowdown')  next = ((row + 1) % 3) * 3 + col;
    if (key === 'arrowleft')  next = row * 3 + ((col + 2) % 3);
    if (key === 'arrowright') next = row * 3 + ((col + 1) % 3);

    if (next !== state.focusIndex) {
      state.focusIndex = next;
      focusCell(next);
    }
  }

  function focusCell(i) {
    const cell = boardEl.querySelector(`.cell[data-idx="${i}"]`);
    if (cell) cell.focus();
  }

  function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('ttt_theme', state.theme);
    applyTheme();
  }

  function applyTheme() {
    // We keep dark as default (no attribute), and set light explicitly.
    document.documentElement.dataset.theme = state.theme;
    themeBtn.textContent = `Theme: ${state.theme[0].toUpperCase()}${state.theme.slice(1)}`;
    themeBtn.setAttribute('aria-pressed', String(state.theme === 'dark'));
  }

  init();
})();
