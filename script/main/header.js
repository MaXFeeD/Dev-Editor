/*

   Copyright 2018-2022 Nernar (github.com/nernar)
   
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
   
       http://www.apache.org/licenses/LICENSE-2.0
   
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

*/

// Currently build information
const REVISION = "develop-alpha-0.4-01.06.2022-0";
const NAME = __mod__.getInfoProperty("name");
const AUTHOR = __mod__.getInfoProperty("author");
const VERSION = __mod__.getInfoProperty("version");
const DESCRIPTION = __mod__.getInfoProperty("description");

// Configurable: autosave
let autosave = true;
let autosavePeriod = 45;
let autosaveProjectable = true;

// Configurable: interface
let maxWindows = 8;
let fontScale = uiScaler = 1.;
let menuDividers = false;
let projectHeaderBackground = false;

// Configurable: messages
let hintStackableDenied = false;
let maximumHints = 25;
let showProcesses = true;
let safetyProcesses = true;

// Configurable: modules
let currentEnvironment = __name__;
let isSupportEnv = false;

// Configurable: explorer
let maximumThumbnailBounds = 96;
let maximumAllowedBounds = 1920;
let importAutoselect = false;

// Different values
let keyExpiresSoon = false;
let ignoreKeyDeprecation = false;
let noImportedScripts = true;

// Runtime changed values
let warningMessage = null;

// Definitions for default values
let firstLaunchTutorial = REVISION.startsWith("testing");
let typeface = android.graphics.Typeface.MONOSPACE;
let typefaceJetBrains = android.graphics.Typeface.MONOSPACE;

if (this.isInstant === undefined) {
	this.isInstant = false;
}

Object.defineProperty(this, "context", {
	get: function() {
		return getContext();
	},
	enumerable: true,
	configurable: false
});

MCSystem.setLoadingTip(NAME + ": Resolving");

IMPORT("Retention:5");

const prepareDebugInfo = function() {
	return NAME + " " + VERSION + " by " + AUTHOR + " for " + (isHorizon ? "Horizon" : "Inner Core") +
		" Report Log\nREVISION " + REVISION.toUpperCase() + ", ANDROID " + android.os.Build.VERSION.SDK_INT;
};

let alreadyHasDate = false;
reportError.setStackAction(function(err) {
	let message = reportError.getCode(err) + ": " + reportError.getStack(err),
		file = new java.io.File(Dirs.LOGGING, REVISION + ".log");
	if (file.isDirectory()) {
		Files.deleteRecursive(file.getPath());
	}
	file.getParentFile().mkdirs();
	if (!file.exists()) {
		Files.write(file, prepareDebugInfo());
	}
	if (!alreadyHasDate) {
		Files.addText(file, "\n" + reportError.getLaunchTime());
		alreadyHasDate = true;
	}
	Files.addText(file, "\n" + message);
	showHint(translate("Error stack saved into internal storage"));
});

reportError.setReportAction(function(err) {
	Logger.Log(reportError.getCode(err) + ": " + err, "ERROR");
});

Interface.getFontSize = function(size) {
	return Math.round(this.getX(size) / this.Display.DENSITY * fontScale);
};

Interface.getX = function(x) {
	return x > 0 ? Math.round(this.Display.WIDTH / (1280 / x) * uiScaler) : x;
};

Interface.getY = function(y) {
	return y > 0 ? Math.round(this.Display.HEIGHT / (720 / y) * uiScaler) : y;
};

IMPORT("Drawable:1");

const requireLogotype = function() {
	return tryoutSafety(function() {
		if (REVISION.indexOf("alpha") != -1) {
			return "logo_alpha";
		} else if (REVISION.indexOf("beta") != -1) {
			return "logo_beta";
		} else if (REVISION.indexOf("preview") != -1) {
			return "logo_preview";
		}
	}, "logo");
};

const requireInvertedLogotype = function() {
	let logotype = requireLogotype();
	if (logotype == "logo") return "logo_beta";
	if (logotype == "logo_alpha") return "logo_preview";
	if (logotype == "logo_beta") return "logo";
	if (logotype == "logo_preview") return "logo_alpha";
	Logger.Log("No inverted logotype for " + logotype, "INFO");
};

const isInvertedLogotype = function() {
	let logotype = requireLogotype();
	return logotype == "logo_alpha" || logotype == "logo_beta";
};

const findCorePackage = function() {
	return tryout(function() {
		return isHorizon ? Packages.com.zhekasmirnov.innercore : Packages.zhekasmirnov.launcher;
	}, function(e) {
		MCSystem.throwException("Impossible find engine package, please referr developer");
	}, null);
};

const findAssertionPackage = function() {
	return tryout(function() {
		return Packages.io.nernar;
	}, function(e) {
		MCSystem.throwException("Impossible find assertion package, please referr developer");
	}, null);
};

const findEditorPackage = function() {
	return tryout(function() {
		return findAssertionPackage().innercore.editor;
	}, function(e) {
		MCSystem.throwException("Impossible find modification package, please referr developer");
	}, null);
};

IMPORT("Stacktrace:2");

const retraceOrReport = function(error) {
	error && Logger.Log(error, "WARNING");
	if (REVISION.startsWith("develop")) {
		reportTrace(error);
	} else {
		reportError(error);
	}
};

if (REVISION.startsWith("develop")) {
	reportTrace.setupPrint(function(message) {
		message !== undefined && showHint(message);
	});
	if (isInstant) {
		reportTrace.reloadModifications();
	}
	tryout(function() {
		let $ = new JavaImporter(findCorePackage().mod.executable.library),
			dependency = new $.LibraryDependency("Retention");
		dependency.setParentMod(__mod__);
		let library = $.LibraryRegistry.resolveDependency(dependency);
		if (!library.isLoaded()) {
			MCSystem.throwException("Retention.js library required for this modification");
		}
		library.getScope().reportError = reportTrace;
	});
}

IMPORT("Action:4");
IMPORT("Sequence:1");

const $ = {
	CORE_ENGINE_API_LEVEL: 0
};

const isCoreEngineLoaded = function() {
	return $.CORE_ENGINE_API_LEVEL != 0;
};

const getCoreEngineAndInjectIfNeeded = function() {
	return tryout(function() {
		if (isCoreEngineLoaded()) {
			return $;
		}
		let instance = null;
		let CoreEngineAPI = findCorePackage().api.mod.coreengine.CoreEngineAPI;
		let field = tryout(function() {
			return CoreEngineAPI.__javaObject__.getDeclaredField("ceHandlerSingleton");
		}, function(e) {
			let declared = CoreEngineAPI.__javaObject__.getDeclaredField("coreEngineHandler");
			instance = findCorePackage().api.mod.API.getInstanceByName("CoreEngine");
			return declared;
		});
		field.setAccessible(true);
		let ceHandlerSingleton = field.get(instance);
		if (ceHandlerSingleton != null) {
			ceHandlerSingleton.injectCoreAPI($);
		}
		notifyCoreEngineLoaded();
		return $;
	}, $);
};

Callback.addCallback("PreBlocksDefined", function() {
	getCoreEngineAndInjectIfNeeded();
});

getPlayerEnt = function() {
	if (LevelInfo.isLoaded()) {
		return Number(Player.get());
	}
	return 0;
};

const isFirstLaunch = function() {
	return tryoutSafety(function() {
		return loadSetting("user_login.first_launch", "boolean");
	}, false);
};

IMPORT("Network:2");

const calloutOrParse = function(scope, value, args) {
	return tryout(function() {
		if (typeof value == "function") {
			if (args === undefined) {
				args = [];
			} else if (!Array.isArray(args)) {
				args = [args];
			}
			return value.apply(scope, args);
		}
		return value;
	}, null);
};

const parseCallback = function(scope, value, args) {
	return tryout(function() {
		if (args === undefined) {
			args = [];
		} else if (!Array.isArray(args)) {
			args = [args];
		}
		if (typeof value == "function") {
			return function() {
				let argArray = args.slice();
				argArray = argArray.concat(Array.prototype.slice.call(arguments));
				return value.apply(scope, argArray);
			};
		}
	}, null);
};
