function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function loadTasks() {
  const saved = localStorage.getItem('allTasks');
  if (saved) {
    return JSON.parse(saved);
  }

  return [
    {
      id: Date.now(),
      title: "Client meeting preparation",
      description: "",
      dueDate: getTodayDate(),
      priority: "high",
      tags: ["Work"],
      completed: false,
      isImportant: true,
      status: "to-do"
    },
    {
      id: Date.now() + 1,
      title: "Front End Campus",
      description: "",
      dueDate: getTodayDate(),
      priority: "medium",
      tags: ["Work"],
      completed: false,
      isImportant: false,
      status: "to-do"
    }
  ];
}

function saveTasks(tasks) {
  localStorage.setItem('allTasks', JSON.stringify(tasks));
}

let allTasks = loadTasks();

function getTasksByPage(pageKey) {
  const today = getTodayDate();

  switch (pageKey) {
    case 'myday':
      return allTasks.filter(task => task.dueDate === today);
    case 'important':
      return allTasks.filter(task => task.isImportant);
    case 'planned':
      return allTasks.filter(task => task.dueDate && task.dueDate !== today);
    case 'alltasks':
    default:
      return [...allTasks];
  }
}

function calculateProgress(tasks) {
  if (tasks.length === 0) {
    return { percent: 0, completed: 0, total: 0 };
  }
  const completed = tasks.filter(t => t.completed).length;
  const percent = Math.round((completed / tasks.length) * 100);
  return { percent, completed, total: tasks.length };
}

function renderPage(pageKey) {
  const tasks = getTasksByPage(pageKey);
  const progress = calculateProgress(tasks);

  const pageConfig = {
    myday: { title: "My Day", icon: "fa-sun", color: "#FFD43B" },
    important: { title: "Important", icon: "fa-star", color: "#FFC107" },
    planned: { title: "Planned", icon: "fa-calendar-days", color: "#2196F3" },
    alltasks: { title: "All Tasks", icon: "fa-list-check", color: "#9C27B0" }
  };

  const config = pageConfig[pageKey] || pageConfig.myday;

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  let tasksHtml = '';
  if (tasks.length === 0) {
    tasksHtml = `<p style="color: #888; text-align: center; margin-top: 30px;">No tasks yet</p>`;
  } else {
    tasksHtml = tasks.map(task => {
      const tagsText = task.tags.length > 0 ? task.tags.join(' • ') : 'No tags';
      let dateText = 'No date';
      if (task.dueDate) {
        if (task.dueDate === getTodayDate()) {
          dateText = 'Today';
        } else {
          const taskDate = new Date(task.dueDate);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];
          if (task.dueDate === tomorrowStr) {
            dateText = 'Tomorrow';
          } else {
            dateText = taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
        }
      }

      return `
        <div class="task-item" data-task-id="${task.id}">
          <input type="checkbox" ${task.completed ? 'checked' : ''} />
          <div class="task-info ${task.completed ? 'completed' : ''}">
            <p class="task-title">${task.title}</p>
            <span class="task-meta">${tagsText} • ${dateText}</span>
          </div>
          <div class="task-actions">
            <i class="fa-solid fa-star ${task.isImportant ? '' : 'inactive'}" 
               style="color: ${task.isImportant ? 'gold' : '#ccc'}; cursor: pointer;" title="Toggle Important"></i>
            <button class="edit" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="delete" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      `;
    }).join('');
  }

  document.querySelector('.main-content').innerHTML = `
    <header>
      <div class="header-title">
        <div class="icon-box" style="background: ${config.color};">
          <i class="fa-solid ${config.icon}"></i>
        </div>
        <div class="title-text">
          <h2>${config.title}</h2>
          <p class="date">${formattedDate}</p>
        </div>
      </div>
      <button id="addTaskBtn" data-page="${pageKey}">
        <i class="fa-solid fa-plus"></i> Add Task
      </button>
    </header>

    <section class="progress-section">
      <label>${config.title} Progress</label>
      <div class="progress-bar">
        <div class="progress" style="width: ${progress.percent}%;"></div>
      </div>
      <p class="progress-text">${progress.completed} of ${progress.total} completed</p>
    </section>

    <section class="task-list">
      ${tasksHtml}
    </section>
  `;

  //  Add Task
  document.getElementById('addTaskBtn').addEventListener('click', () => {
    document.getElementById('taskPopup').dataset.currentPage = pageKey;
    document.getElementById('taskPopup').style.display = 'flex';
  });

  // ربط مربعات الاختيار
  document.querySelectorAll('.task-item input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const taskId = parseInt(this.closest('.task-item').dataset.taskId);
      const task = allTasks.find(t => t.id === taskId);
      if (task) {
        task.completed = this.checked;
        saveTasks(allTasks);
        renderPage(pageKey);
      }
    });
  });

  // (ربط النجوما)
  document.querySelectorAll('.task-item .fa-star').forEach(star => {
    star.addEventListener('click', function() {
      const taskId = parseInt(this.closest('.task-item').dataset.taskId);
      const task = allTasks.find(t => t.id === taskId);
      if (task) {
        task.isImportant = !task.isImportant;
        saveTasks(allTasks);
        renderPage(pageKey);
      }
    });
  });

  //  أزرار الحذف
  document.querySelectorAll('.task-item .delete').forEach(btn => {
    btn.addEventListener('click', function() {
      const taskId = parseInt(this.closest('.task-item').dataset.taskId);
      allTasks = allTasks.filter(task => task.id !== taskId);
      saveTasks(allTasks);
      renderPage(pageKey);
    });
  });

  //  أزرار التعديل
  document.querySelectorAll('.task-item .edit').forEach(btn => {
    btn.addEventListener('click', function() {
      const taskId = parseInt(this.closest('.task-item').dataset.taskId);
      const task = allTasks.find(t => t.id === taskId);
      if (task) {
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskDueDate').value = task.dueDate;
        document.getElementById('taskStatus').value = task.status;
        
        document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.priority-btn[data-priority="${task.priority}"]`).classList.add('active');
        
        document.getElementById('taskTags').value = task.tags.join(', ');
        
        document.getElementById('taskPopup').dataset.currentPage = pageKey;
        document.getElementById('taskPopup').dataset.editingId = taskId;
        document.getElementById('taskPopup').style.display = 'flex';
      }
    });
  });
}

// معالج الفورم
document.getElementById('taskForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const title = document.getElementById('taskTitle').value.trim();
  if (!title) return;

  const currentPage = document.getElementById('taskPopup').dataset.currentPage || 'myday';
  const editingId = document.getElementById('taskPopup').dataset.editingId;

  const newTask = {
    id: editingId ? parseInt(editingId) : Date.now(),
    title: title,
    description: document.getElementById('taskDescription').value.trim(),
    dueDate: document.getElementById('taskDueDate').value || getTodayDate(),
    priority: document.querySelector('.priority-btn.active').dataset.priority,
    tags: document.getElementById('taskTags').value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 6),
    completed: document.getElementById('taskStatus').value === 'done',
    isImportant: document.querySelector('.priority-btn.active').dataset.priority === 'high',
    status: document.getElementById('taskStatus').value
  };

  if (editingId) {
    const index = allTasks.findIndex(t => t.id === parseInt(editingId));
    if (index !== -1) {
      allTasks[index] = newTask;
    }
  } else {
    allTasks.push(newTask);
  }

  saveTasks(allTasks);
  document.getElementById('taskPopup').style.display = 'none';
  this.reset();
  document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.priority-btn.medium').classList.add('active');
  delete document.getElementById('taskPopup').dataset.editingId;

  renderPage(currentPage);
});

// أزرار التاريخ السريع
document.getElementById('setToday').addEventListener('click', () => {
  document.getElementById('taskDueDate').value = getTodayDate();
});

document.getElementById('setTomorrow').addEventListener('click', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  document.getElementById('taskDueDate').value = `${year}-${month}-${day}`;
});

// أزرار الأولوية
document.querySelectorAll('.priority-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});

// إغلاق الفورم
document.getElementById('cancelBtn').addEventListener('click', () => {
  document.getElementById('taskPopup').style.display = 'none';
  document.getElementById('taskForm').reset();
  document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.priority-btn.medium').classList.add('active');
  delete document.getElementById('taskPopup').dataset.editingId;
});

document.getElementById('taskPopup').addEventListener('click', (e) => {
  if (e.target === document.getElementById('taskPopup')) {
    document.getElementById('taskPopup').style.display = 'none';
    document.getElementById('taskForm').reset();
    document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.priority-btn.medium').classList.add('active');
    delete document.getElementById('taskPopup').dataset.editingId;
  }
});

// ربط أزرار التنقل
document.querySelectorAll('[data-page]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const pageKey = e.target.closest('[data-page]').dataset.page;
    renderPage(pageKey);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  renderPage('myday');
});

// May the peace, blessings, and mercy of God be upon you