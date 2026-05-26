const BASE_URL = 'http://localhost:3000/api';

let merchants = [];
let currentUser = { openid: 'test_user', nickname: '测试用户' };

async function request(url, data = {}, method = 'GET') {
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'openid': currentUser.openid
    }
  };
  if (method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  const response = await fetch(BASE_URL + url, options);
  return response.json();
}

async function loadMerchants() {
  const result = await request('/merchant/list');
  if (result.code === 200) {
    merchants = result.data;
    renderMerchantList(merchants);
    populateMerchantSelects();
  }
}

function renderMerchantList(merchantList) {
  const container = document.getElementById('merchantList');
  container.innerHTML = merchantList.map(m => `
    <div class="col">
      <div class="card merchant-card h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h5 class="card-title">${m.merchantName}</h5>
            <span class="tag tag-${m.merchantType}">${getTypeText(m.merchantType)}</span>
          </div>
          <p class="text-sm text-muted mb-3">${m.address}</p>
          <div class="price-info">
            <div class="price-item">
              <p class="price-item-label">起送价</p>
              <p class="price-item-value">¥${m.minPrice}</p>
            </div>
            <div class="price-item">
              <p class="price-item-label">配送费</p>
              <p class="price-item-value">¥${m.deliveryFee}</p>
            </div>
          </div>
          <div class="discount-section">
            <p class="discount-label">满减规则</p>
            <p class="discount-rules">${parseDiscountRules(m.discountRules)}</p>
          </div>
          <button class="btn btn-primary w-100 mt-3" onclick="selectMerchant(${m.id})">
            <i class="fa fa-shopping-bag me-1"></i>去凑单
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function getTypeText(type) {
  const types = { takeout: '外卖', fresh: '生鲜', market: '商超' };
  return types[type] || type;
}

function parseDiscountRules(rules) {
  try {
    const ruleArray = typeof rules === 'string' ? JSON.parse(rules) : rules;
    return ruleArray.map(r => `满${r.full}减${r.reduce}`).join('，');
  } catch {
    return rules;
  }
}

function populateMerchantSelects() {
  const calcSelect = document.getElementById('calcMerchant');
  const publishSelect = document.getElementById('publishMerchant');
  const options = merchants.map(m => 
    `<option value="${m.id}" data-minprice="${m.minPrice}" data-rules="${m.discountRules}" data-type="${m.merchantType}">${m.merchantName}</option>`
  ).join('');
  calcSelect.innerHTML = options;
  publishSelect.innerHTML = options;
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const type = btn.dataset.type;
    if (type === 'all') {
      renderMerchantList(merchants);
    } else {
      renderMerchantList(merchants.filter(m => m.merchantType === type));
    }
  });
});

document.getElementById('calcBtn').addEventListener('click', async () => {
  const select = document.getElementById('calcMerchant');
  const selectedPrice = parseFloat(document.getElementById('selectedPrice').value);
  const option = select.options[select.selectedIndex];
  
  const params = {
    minPrice: parseFloat(option.dataset.minprice),
    discountRules: option.dataset.rules,
    selectedPrice: selectedPrice,
    merchantType: option.dataset.type
  };
  
  const result = await request('/calculator/compute', params, 'POST');
  if (result.code === 200) {
    renderCalcResult(result.data);
    renderRecommendItems(result.data.recommendItems);
  }
});

function renderCalcResult(data) {
  const container = document.getElementById('calcResult');
  container.innerHTML = `
    <div class="text-center mb-4">
      <p class="text-muted text-sm mb-2">距离起送价还差</p>
      <p class="result-amount">¥${data.minPriceDiff}</p>
    </div>
    <div class="best-discount">
      <p class="discount-title">最优满减方案</p>
      <p class="discount-value">满${data.bestDiscount.full}减${data.bestDiscount.reduce}</p>
      <p class="text-sm text-muted mt-1">还需凑单 ¥${data.bestDiscount.diff}</p>
    </div>
    <div class="price-compare">
      <div class="compare-item">
        <p class="compare-label">单人购买</p>
        <p class="compare-value single">¥${data.priceCompare.singlePrice}</p>
      </div>
      <div class="compare-item">
        <p class="compare-label">拼单购买</p>
        <p class="compare-value group">¥${data.priceCompare.groupPrice}</p>
      </div>
      <div class="compare-item">
        <p class="compare-label">节省</p>
        <p class="compare-value save">¥${data.priceCompare.saveMoney}</p>
      </div>
    </div>
  `;
}

function renderRecommendItems(items) {
  const container = document.getElementById('recommendItems');
  container.innerHTML = items.map(item => `
    <div class="recommend-item">
      <p class="recommend-item-name">${item.name}</p>
      <p class="recommend-item-price">¥${item.price}</p>
      <button class="btn btn-sm btn-outline-primary" onclick="addToCart(${item.price})">
        <i class="fa fa-plus me-1"></i>添加
      </button>
    </div>
  `).join('');
}

function addToCart(price) {
  const current = parseFloat(document.getElementById('selectedPrice').value) || 0;
  document.getElementById('selectedPrice').value = (current + price).toFixed(2);
}

function selectMerchant(id) {
  const merchant = merchants.find(m => m.id === id);
  document.getElementById('calcMerchant').value = id;
  document.getElementById('selectedPrice').value = '';
  document.getElementById('calcResult').innerHTML = `
    <i class="fa fa-calculator empty-icon"></i>
    <p class="empty-text">已选择 ${merchant.merchantName}</p>
    <p class="text-sm text-muted">请输入购物金额</p>
  `;
  document.getElementById('recommendItems').innerHTML = '';
  
  document.querySelector('a[href="#calculator"]').click();
}

async function loadGroupbuys() {
  const result = await request('/groupbuy/list');
  if (result.code === 200) {
    renderGroupbuyList(result.data);
  }
}

function renderGroupbuyList(groupbuys) {
  const container = document.getElementById('groupbuyList');
  if (groupbuys.length === 0) {
    container.innerHTML = '<div class="col-12 empty-state"><i class="fa fa-inbox empty-icon"></i><p class="empty-text">暂无拼单信息</p></div>';
    return;
  }
  container.innerHTML = groupbuys.map(g => `
    <div class="col">
      <div class="card groupbuy-card h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h5 class="card-title">${g.merchantName}</h5>
            <span class="tag tag-${g.merchantType}">${getTypeText(g.merchantType)}</span>
          </div>
          <div class="groupbuy-info">
            <div class="groupbuy-row">
              <span class="groupbuy-label">目标金额</span>
              <span class="groupbuy-value">¥${g.minPrice}</span>
            </div>
            <div class="groupbuy-row">
              <span class="groupbuy-label">每人分摊</span>
              <span class="groupbuy-value primary">¥${g.shareAmount}</span>
            </div>
            <div class="groupbuy-row">
              <span class="groupbuy-label">当前人数</span>
              <span class="groupbuy-value ${g.currentPeople >= g.maxPeople ? 'success' : ''}">${g.currentPeople}/${g.maxPeople}</span>
            </div>
            <div class="groupbuy-row">
              <span class="groupbuy-label">截止时间</span>
              <span class="groupbuy-value">${formatTime(g.orderTime)}</span>
            </div>
          </div>
          ${g.remark ? `<p class="text-sm text-muted mt-3 mb-3">${g.remark}</p>` : ''}
          <button class="btn ${g.currentPeople >= g.maxPeople ? 'btn-secondary disabled' : 'btn-primary'} w-100" onclick="joinGroupbuy('${g.groupBuyId}')">
            ${g.currentPeople >= g.maxPeople ? '<i class="fa fa-check-circle me-1"></i>已满员' : '<i class="fa fa-users me-1"></i>参与拼单'}
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function formatTime(time) {
  return new Date(time).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function joinGroupbuy(groupBuyId) {
  const result = await request('/groupbuy/join', { groupBuyId }, 'POST');
  if (result.code === 200) {
    alert('参与成功！');
    loadGroupbuys();
  } else {
    alert(result.msg);
  }
}

document.getElementById('submitPublish').addEventListener('click', async () => {
  const select = document.getElementById('publishMerchant');
  const option = select.options[select.selectedIndex];
  
  const data = {
    merchantId: parseInt(select.value),
    merchantName: option.text,
    merchantType: option.dataset.type,
    minPrice: parseFloat(option.dataset.minprice),
    discountRules: option.dataset.rules,
    orderTime: document.getElementById('orderTime').value,
    maxPeople: parseInt(document.getElementById('maxPeople').value),
    shareAmount: parseFloat(document.getElementById('shareAmount').value),
    remark: document.getElementById('remark').value
  };
  
  const result = await request('/groupbuy/publish', data, 'POST');
  if (result.code === 200) {
    alert('发布成功！');
    document.getElementById('publishModal').querySelector('.btn-close').click();
    loadGroupbuys();
  } else {
    alert(result.msg);
  }
});

async function loadReminders() {
  const result = await request('/reminder/list');
  if (result.code === 200) {
    renderReminderList(result.data);
    document.getElementById('reminderCount').textContent = result.data.length;
  }
}

function renderReminderList(reminders) {
  const container = document.getElementById('reminderList');
  if (reminders.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fa fa-calendar empty-icon"></i><p class="empty-text">暂无食材提醒</p></div>';
    return;
  }
  container.innerHTML = reminders.map(r => `
    <div class="reminder-item">
      <div class="reminder-info">
        <div class="reminder-icon">
          <i class="fa fa-lemon-o"></i>
        </div>
        <div class="reminder-details">
          <h6>${r.foodName}</h6>
          <p>${getFoodTypeText(r.foodType)} · ${formatDate(r.expireTime)}</p>
        </div>
      </div>
      <button class="btn btn-sm btn-danger" onclick="deleteReminder('${r.reminderId}')">
        <i class="fa fa-trash"></i>
      </button>
    </div>
  `).join('');
}

function getFoodTypeText(type) {
  const types = { vegetable: '蔬菜', fruit: '水果', meat: '肉类', dairy: '蛋奶', other: '其他' };
  return types[type] || type;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('zh-CN');
}

document.getElementById('submitReminder').addEventListener('click', async () => {
  const data = {
    foodName: document.getElementById('foodName').value,
    foodType: document.getElementById('foodType').value,
    expireTime: document.getElementById('expireDate').value + 'T23:59:59',
    remindTime: parseInt(document.getElementById('remindTime').value)
  };
  
  const result = await request('/reminder/add', data, 'POST');
  if (result.code === 200) {
    alert('添加成功！');
    document.getElementById('reminderModal').querySelector('.btn-close').click();
    loadReminders();
  } else {
    alert(result.msg);
  }
});

async function deleteReminder(reminderId) {
  if (confirm('确定删除这个提醒吗？')) {
    const result = await request('/reminder/delete', { reminderId }, 'POST');
    if (result.code === 200) {
      loadReminders();
    }
  }
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    
    document.querySelectorAll('a[href^="#"]').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('show', 'active'));
    document.getElementById(targetId).classList.add('show', 'active');
    
    if (targetId === 'groupbuy') {
      loadGroupbuys();
    } else if (targetId === 'profile') {
      loadReminders();
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  loadMerchants();
  loadGroupbuys();
  document.getElementById('userNickname').textContent = currentUser.nickname;
});