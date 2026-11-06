const chocolateCount = document.getElementById('chocolateCount');
const breadCount = document.getElementById('breadCount');
const salesValue = document.getElementById('salesValue');
const pendingValue = document.getElementById('pendingValue');
const goalValue = document.getElementById('goalValue');
const notepad = document.getElementById('notepad');
const calcDisplay = document.getElementById('calcDisplay');

const state = {
  chocolate: 18,
  bread: 31,
  sales: 12840,
  pending: 7,
  goal: 78,
  calc: '0',
  calcEvaluated: false,
};

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function updateSalesAndGoal() {
  salesValue.textContent = formatCurrency(state.sales);
  pendingValue.textContent = String(state.pending).padStart(2, '0');
  goalValue.textContent = `${state.goal}%`;
  const ring = document.querySelector('.ring-progress');
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const dash = (state.goal / 100) * circumference;
  ring.style.strokeDasharray = `${circumference}`;
  ring.style.strokeDashoffset = `${circumference - dash}`;
}

function updateMiniAppValues() {
  chocolateCount.textContent = state.chocolate;
  breadCount.textContent = state.bread;
  state.sales = 12840 + (state.chocolate * 90) + (state.bread * 55);
  state.pending = Math.max(3, 7 + Math.ceil((state.chocolate + state.bread) / 15) - 2);
  state.goal = Math.min(98, 72 + Math.round((state.chocolate + state.bread) / 12));
  updateSalesAndGoal();
}

document.querySelectorAll('[data-target]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.target;
    const step = Number(button.dataset.step);

    if (target === 'chocolate') {
      state.chocolate = Math.max(0, state.chocolate + step);
      chocolateCount.textContent = state.chocolate;
    }

    if (target === 'bread') {
      state.bread = Math.max(0, state.bread + step);
      breadCount.textContent = state.bread;
    }

    updateMiniAppValues();
  });
});

const taskButtons = document.querySelectorAll('.task-item button');
taskButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.task-item');
    item.classList.toggle('done');
    button.textContent = item.classList.contains('done') ? '✓' : '+';
  });
});

if (localStorage.getItem('notepad')) {
  notepad.value = localStorage.getItem('notepad');
}

notepad.addEventListener('input', () => {
  localStorage.setItem('notepad', notepad.value);
});

function appendCalcValue(value) {
  if (state.calc === '0' || state.calcEvaluated) {
    state.calc = value;
    state.calcEvaluated = false;
  } else {
    state.calc += value;
  }

  calcDisplay.textContent = state.calc;
}

function calculateExpression() {
  try {
    const expr = state.calc.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    const result = Function(`"use strict"; return (${expr})`)();
    state.calc = Number.isFinite(result) ? String(result) : 'ERROR';
    calcDisplay.textContent = state.calc;
    state.calcEvaluated = true;
  } catch {
    state.calc = 'ERROR';
    calcDisplay.textContent = 'ERROR';
    state.calcEvaluated = true;
  }
}

document.querySelectorAll('.calc-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    const value = button.dataset.value;

    if (action === 'clear') {
      state.calc = '0';
      state.calcEvaluated = false;
      calcDisplay.textContent = state.calc;
      return;
    }

    if (action === 'delete') {
      state.calc = state.calc.length > 1 ? state.calc.slice(0, -1) : '0';
      state.calcEvaluated = false;
      calcDisplay.textContent = state.calc;
      return;
    }

    if (action === 'percent') {
      if (state.calc !== '0' && state.calc !== 'ERROR') {
        state.calc = String(Number(state.calc) / 100);
        calcDisplay.textContent = state.calc;
      }
      return;
    }

    if (action === 'equals') {
      calculateExpression();
      return;
    }

    if (value) {
      appendCalcValue(value);
    }
  });
});

updateSalesAndGoal();
updateMiniAppValues();
