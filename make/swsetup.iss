; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

[Setup]
PrivilegesRequired=admin
AppId={{8F7C3DA3-E34D-434D-8984-13AB1937EFAE}
AppName=Screenwerk 2014
AppVersion=1.0.0
;AppVerName=Screenwerk 2014 1.0.0
AppPublisher=Entusiastid O�
AppPublisherURL=http://www.entu.ee/
AppSupportURL=http://www.entu.ee/
AppUpdatesURL=http://www.entu.ee/
DefaultDirName={pf}\Screenwerk 2014
DisableDirPage=yes
DefaultGroupName=Screenwerk 2014
DisableProgramGroupPage=yes
LicenseFile=Y:\Screenwerk\LICENSE.md
OutputDir=Y:\Screenwerk\bin
OutputBaseFilename=swsetup
SetupIconFile=Y:\Screenwerk\imgs\sw-p512.ico
Compression=lzma
SolidCompression=yes

[Registry]
Root: HKLM; Subkey: "SOFTWARE\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "Screenwerk 2014"; ValueData: """{app}\screenwerk.exe"""; Flags: uninsdeletevalue

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
Name: "german"; MessagesFile: "compiler:Languages\German.isl"
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 0,6.1

[Files]
Source: "Y:\Screenwerk\bin\Screenwerk 2014\screenwerk.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "Y:\Screenwerk\bin\Screenwerk 2014\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{group}\Screenwerk 2014"; Filename: "{app}\screenwerk.exe"
Name: "{group}\{cm:ProgramOnTheWeb,Screenwerk 2014}"; Filename: "http://www.entu.ee/"
Name: "{group}\{cm:UninstallProgram,Screenwerk 2014}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\Screenwerk 2014"; Filename: "{app}\screenwerk.exe"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Screenwerk 2014"; Filename: "{app}\screenwerk.exe"; Tasks: quicklaunchicon

[Run]
Filename: "{app}\screenwerk.exe"; Description: "{cm:LaunchProgram,Screenwerk 2014}"; Flags: nowait postinstall skipifsilent

