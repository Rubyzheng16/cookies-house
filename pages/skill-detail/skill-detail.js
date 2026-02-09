// 技能分类详情页
import { skillTreeService } from '../../services/skillTree.js';

Page({
  data: {
    category: '',
    categoryInfo: null,
    items: []
  },

  onLoad(options) {
    const category = options.category || '';
    const categoryInfo = skillTreeService.getCategoryById(category);
    const items = skillTreeService.getItems(category);

    this.setData({
      category,
      categoryInfo: categoryInfo || { id: category, name: category, icon: '📦' },
      items
    });

    if (categoryInfo) {
      wx.setNavigationBarTitle({
        title: `${categoryInfo.icon} ${categoryInfo.name}`
      });
    }
  },

  onShow() {
    this.loadItems();
  },

  loadItems() {
    const category = this.data.category;
    if (!category) return;
    const items = skillTreeService.getItems(category);
    this.setData({ items });
  },

  // 点击星形：设置该维度为点击的星级
  onStarTap(e) {
    const { id, type, value } = e.currentTarget.dataset;
    const updates = type === 'love' ? { loveStars: value } : { masteryStars: value };
    skillTreeService.updateItem(id, updates);
    this.loadItems();
  },

  // 添加
  onAdd() {
    wx.showModal({
      title: '添加技能',
      editable: true,
      placeholderText: '输入技能名称，如：网球、滑雪',
      success: (res) => {
        if (!res.confirm) return;
        const name = (res.content || '').trim();
        if (!name) {
          wx.showToast({ title: '请输入名称', icon: 'none' });
          return;
        }
        skillTreeService.addItem({
          name,
          categoryId: this.data.category
        });
        this.loadItems();
        this.syncPrevPageCategories();
        wx.showToast({ title: '已添加', icon: 'success' });
      }
    });
  },

  // 编辑
  onEdit(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.items.find((i) => i.id === id);
    if (!item) return;

    wx.showActionSheet({
      itemList: ['修改名称', '修改备注与决策', '删除'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.editName(item);
        } else if (res.tapIndex === 1) {
          this.editNoteAndDecision(item);
        } else if (res.tapIndex === 2) {
          this.deleteItem(item);
        }
      }
    });
  },

  editName(item) {
    wx.showModal({
      title: '修改名称',
      editable: true,
      content: item.name,
      success: (res) => {
        if (!res.confirm) return;
        const name = (res.content || '').trim();
        if (!name) {
          wx.showToast({ title: '名称不能为空', icon: 'none' });
          return;
        }
        skillTreeService.updateItem(item.id, { name });
        this.loadItems();
        wx.showToast({ title: '已更新', icon: 'success' });
      }
    });
  },

  editNoteAndDecision(item) {
    wx.showModal({
      title: '备注与决策',
      editable: true,
      content: item.note || '',
      placeholderText: '如：不适合!!、先放手、继续深耕',
      success: (res) => {
        if (!res.confirm) return;
        const note = (res.content || '').trim();
        wx.showActionSheet({
          itemList: ['继续', '放手', '待定'],
          success: (actionRes) => {
            const decisionMap = ['continue', 'let_go', null];
            const decision = decisionMap[actionRes.tapIndex];
            skillTreeService.updateItem(item.id, { note: note || undefined, decision });
            this.loadItems();
            wx.showToast({ title: '已更新', icon: 'success' });
          },
          fail: () => {
            skillTreeService.updateItem(item.id, { note: note || undefined });
            this.loadItems();
            wx.showToast({ title: '已更新', icon: 'success' });
          }
        });
      }
    });
  },

  deleteItem(item) {
    wx.showModal({
      title: '删除',
      content: `确定要删除「${item.name}」吗？`,
      success: (res) => {
        if (!res.confirm) return;
        skillTreeService.deleteItem(item.id);
        this.loadItems();
        wx.showToast({ title: '已删除', icon: 'success' });
      }
    });
  },

  // 通知上一个页面（糖果罐技能树 tab）刷新分类计数
  syncPrevPageCategories() {
    const pages = getCurrentPages();
    if (pages.length < 2) return;
    const prevPage = pages[pages.length - 2];
    if (prevPage && typeof prevPage.loadSkillCategories === 'function') {
      prevPage.loadSkillCategories();
    }
  }
});
