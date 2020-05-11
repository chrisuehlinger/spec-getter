'use strict';
const os = require("os");
const path = require('path');
const {app, BrowserWindow, Menu, screen} = require('electron');
/// const {autoUpdater} = require('electron-updater');
const {is} = require('electron-util');
const unhandled = require('electron-unhandled');
const debug = require('electron-debug');
const contextMenu = require('electron-context-menu');
const config = require('./config');
const menu = require('./menu');
const packageJson = require('./package.json');

unhandled();
// debug();
contextMenu();

app.setAppUserModelId( 'com.chrisuehlinger.spec-getter' );
// app.setAppUserModelId(packageJson.build.appId);

// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
// if (!is.development) {
// 	const FOUR_HOURS = 1000 * 60 * 60 * 4;
// 	setInterval(() => {
// 		autoUpdater.checkForUpdates();
// 	}, FOUR_HOURS);
//
// 	autoUpdater.checkForUpdates();
// }

// Prevent window from being garbage collected
let mainWindow;

const createMainWindow = async () => {
	const win = new BrowserWindow({
		title: app.name,
		show: false,
		width: 1280,
		height: 720,
		webPreferences:{
			nodeIntegration: true
		}
	});

	win.on('ready-to-show', () => {
		win.show();
	});

	win.on('closed', () => {
		// Dereference the window
		// For multiple windows store them in an array
		mainWindow = undefined;
	});

	await win.loadFile(path.join(__dirname, 'index.html'));

	return win;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

app.on('second-instance', () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		mainWindow.show();
	}
});

app.on('window-all-closed', () => {
	if (!is.macos) {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

(async () => {
	await app.whenReady();
	Menu.setApplicationMenu(menu);
	mainWindow = await createMainWindow();

	const favoriteAnimal = config.get('favoriteAnimal');
	console.log(screen.getAllDisplays());
	mainWindow.webContents.executeJavaScript(`window.showDisplays(${JSON.stringify(screen.getAllDisplays())})`);
	// mainWindow.webContents.executeJavaScript(``)
	// mainWindow.webContents.executeJavaScript(`document.getElementById('cpu').textContent = 'CPU: ${favoriteAnimal}'`);
	// mainWindow.webContents.executeJavaScript(`document.getElementById('ram').textContent = 'RAM: ${Math.round(10*((os.totalmem())/1073741824))/10}GB'`);
})();
