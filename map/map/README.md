# 智能地图路线规划应用 🗺️

一个基于React和Leaflet的智能地图路线规划应用，支持地址输入、坐标输入、直线路径和车辆导航等功能。

## ✨ 功能特性

### 🎯 核心功能
- **双输入模式**：支持地址输入和坐标输入两种方式
- **智能地理编码**：使用Nominatim API将地址转换为坐标
- **多种路径规划**：
  - 直线路径：计算两点间的直线距离
  - 车辆导航：基于真实道路的导航路线
- **实时路径显示**：在地图上动态显示规划的路线
- **路线信息展示**：显示距离、预计时间、导航指令等详细信息

### 🛠️ 技术特性
- **免费API集成**：
  - Nominatim（OpenStreetMap）地理编码服务
  - OSRM（Open Source Routing Machine）路径规划
  - GraphHopper 作为备用路径规划服务
- **响应式设计**：适配不同屏幕尺寸
- **现代化UI**：美观的用户界面和交互体验
- **错误处理**：完善的错误处理和用户提示

## 🚀 快速开始

### 环境要求
- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/xumomobaba/MapDemo.git
   cd MapDemo
   ```

2. **进入前端目录**
   ```bash
   cd frontend
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   打开浏览器访问 `http://localhost:5173`

## 📖 使用指南

### 地址输入模式
1. 选择"📍 地址输入"模式
2. 在起点和终点输入框中输入地址（如："北京市天安门广场"）
3. 点击"🔍 解析地址"按钮进行地理编码
4. 选择路径类型（直线路径或车辆导航）
5. 点击"🗺️ 规划路线"查看结果

### 坐标输入模式
1. 选择"🌐 坐标输入"模式
2. 输入起点和终点的纬度、经度坐标
3. 选择路径类型
4. 点击"计算距离与路径"查看结果

## 🏗️ 项目结构

```
MapDemo/
├── frontend/                 # React前端应用
│   ├── src/
│   │   ├── App.jsx          # 主应用组件
│   │   ├── App.css          # 样式文件
│   │   ├── main.jsx         # 应用入口
│   │   └── index.css        # 全局样式
│   ├── public/              # 静态资源
│   ├── package.json         # 项目依赖
│   └── vite.config.js       # Vite配置
├── src/                     # Java源码（可选）
├── README.md               # 项目文档
└── .gitignore              # Git忽略文件
```

## 🔧 技术栈

### 前端技术
- **React 18**：现代化的前端框架
- **Vite**：快速的构建工具
- **Leaflet**：开源地图库
- **React-Leaflet**：React的Leaflet组件

### API服务
- **Nominatim API**：免费的地理编码服务
- **OSRM API**：开源路径规划服务
- **GraphHopper API**：备用路径规划服务

## 🌟 主要特色

### 🎨 用户体验
- 直观的双模式切换界面
- 实时的地址解析和路径规划
- 清晰的地图标记和路线显示
- 详细的路线信息展示

### 🔒 稳定性
- 多重API备用机制
- 完善的错误处理
- 网络异常处理
- 用户友好的提示信息

### 🚀 性能优化
- 组件懒加载
- API请求优化
- 地图渲染优化
- 响应式设计

## 📝 开发说明

### 可用脚本

在 `frontend` 目录下：

- `npm run dev`：启动开发服务器
- `npm run build`：构建生产版本
- `npm run preview`：预览生产构建
- `npm run lint`：代码质量检查

### 环境变量

项目使用免费的公共API，无需配置API密钥。如需使用其他服务，可在代码中修改API端点。

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues：[提交问题](https://github.com/xumomobaba/MapDemo/issues)
- 项目地址：https://github.com/xumomobaba/MapDemo

---

⭐ 如果这个项目对您有帮助，请给它一个星标！
