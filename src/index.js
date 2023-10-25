const { app, BrowserWindow, Menu, Tray } = require('electron');
const path = require('path'); 
const processMessage = require('./processMessage')

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, `./images/Terminal.png`),
        webPreferences: {
            nodeIntegration: true, // 允许在渲染进程中使用 Node.js API 和第三方模块，这意味着你可以像在 Node.js 中一样使用 require 来引入模块，而不必担心安全问题。
            contextIsolation: false,  // 选择关闭上下文隔离（默认是开启的），以便在渲染进程中使用 IPC 和 Remote 模块。IPC 模块用于进程间通信，Remote 模块用于在主进程和渲染进程之间调用函数或获取数据。
            // nodeIntegrationInWorker: false,  // 禁用 Worker 中的 nodeIntegration
            // enableRemoteModule: false,   // 禁用 remote 模块
            // worldSafeExecuteJavaScript: true,  // 启用沙箱模式，限制 JavaScript 执行权限
            // allowRunningInsecureContent: false, // 禁止加载非安全内容
            // sandbox: true,  // 启用沙箱模式，限制系统资源访问
            // 预加载脚本
            // preload: path.join(__dirname, 'preload.js')
        },
    });

    // 隐藏窗口菜单栏
    mainWindow.setMenuBarVisibility(false);

    // 加载本地页面
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // 打开控制台
    mainWindow.webContents.openDevTools()

    // 主线程和渲染进程通信 
    const ProcessMessage = new processMessage(mainWindow)
    ProcessMessage.init()

    return mainWindow;
}


app.whenReady().then(() => {
    const mainWindow = createMainWindow();
    mainWindow.on('close', () => {
        console.log('close.....')
    })

    app.on('activate', function () {
        // 监听器检查是否存在其他视窗并新建主视窗
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });

    const tray = new Tray(path.join(__dirname, 'images', 'Terminal.png'))

    const contextMenu = Menu.buildFromTemplate([
        {
            label: '设置',
            click: function () {
                console.log('设置.....')
            }
        },
        {
            label: '退出',
            icon: path.join(__dirname, 'images', 'tray', 'exit.png'),
            click: () => {
                app.exit(0);
            }
        }
    ])
    // 当鼠标移动到小图标上方时显示的提示
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu);
});


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
    console.log('all window is closed')
});
