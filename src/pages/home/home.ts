import { Component } from '@angular/core';
import { NavController, ToastController, Platform } from 'ionic-angular';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { GetdataProvider } from '../../providers/getdata/getdata';
import { DashboardPage } from '../dashboard/dashboard';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  task_index  = { 1: 'INTRODUCTION', 2: 'LOGIN'};

  isRecording = false;
  speakstate = 'mic';
  speech_text: string = '';

  account = { mobile_no: '', name: '', age: '', gender: '' };
  
  constructor(public navCtrl: NavController,
              private tts: TextToSpeech,
              private speechRecognition: SpeechRecognition,
              public toastCtrl: ToastController,
              private plt: Platform,
              private getdataProvider:GetdataProvider,
  ) { 
    plt.ready().then(() => {
      this.seekMicroPhonePermission('This app requires Microphone Permission to record audio');
    });
  }

  login()
  {
    this.speak(2, 'Hello, Welcome to Look. Please state your 10 digit mobile number to login', false);
    this.account.mobile_no = this.startListening(2);
  }

  seekMicroPhonePermission(message)
  {
    this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speak(0, message, false)
          this.speechRecognition.requestPermission();
          this.seekMicroPhonePermission('Thanks for permitting Look');
        }
        else{
          this.login();
        }
    });
  }

  signUp(mobile_no)
  {
    this.account.mobile_no = mobile_no;
    this.getdataProvider.signUp(this.account).subscribe(
      (response) => {
        var resp = JSON.parse(response.text());
        var message = resp['message'];
        var account_data = resp['account_data']
        this.speak(2, message, false);

        localStorage.setItem('LOOK_USER', JSON.stringify(account_data));
        this.navCtrl.setRoot(DashboardPage);
      },
      (error) =>{
        var err = JSON.parse(error.text());
        var error_message = err['error'];
        this.speak(2, error_message, false);
      });
  }

  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  async speak(task_index, message, listen_again)
  {
    this.tts.speak(message)
      .catch((reason: any) => console.log(reason));
    await this.delay(3000);
    if(listen_again)
      this.startListening(task_index);
  }

  async presentToast(message: string)
  {
    const toast = await this.toastCtrl.create({
      message: message,
      showCloseButton: false,
      position: 'bottom',
      closeButtonText: 'Done'
    });
    toast.present();
  }

  isIos() 
  {
    return this.plt.is('ios');
  }

  stopListening() 
  {
    this.speechRecognition.stopListening().then(() => {
      this.isRecording = false;
      this.speakstate='mic';
    });
  }
  
  startListening(task_index) 
  {
    let options = {
      language: 'en-IN'
    }
    
    
    this.speechRecognition.startListening(options).subscribe(matches => {
      this.speech_text = matches[0];
      this.speakstate='mic';
      if(task_index == 2)
      {
        if(this.speech_text.length != 12)
          this.speak(2, 'Phone Number must be 10 digits long.', true);
        else
          this.signUp(this.speech_text);
      }
    });
    this.isRecording = true;
    this.speakstate='mic-off';
    return this.speech_text;
  }
}
