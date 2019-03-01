import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { LongPressModule } from 'ionic-long-press';
import { IonBottomDrawerModule } from 'ion-bottom-drawer';

import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { Sim } from '@ionic-native/sim';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions, CameraPreviewDimensions } from '@ionic-native/camera-preview';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { DashboardPage } from '../pages/dashboard/dashboard';

import { GetdataProvider } from '../providers/getdata/getdata';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    DashboardPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    LongPressModule,
    IonBottomDrawerModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    DashboardPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    TextToSpeech,
    SpeechRecognition,
    GetdataProvider,
    Sim,
    AndroidPermissions,
    CameraPreview,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
