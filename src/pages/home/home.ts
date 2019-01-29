import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, ToastController, Platform } from 'ionic-angular';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  isRecording = false;
  speakstate = 'mic';
  speech_text: string = '';
  constructor(
    public navCtrl: NavController,
    private tts: TextToSpeech,
    private speechRecognition: SpeechRecognition,
    private cd: ChangeDetectorRef,
    public toastCtrl: ToastController,
    private plt: Platform,
    ) { }

  speak(){
    this.tts.speak('You are listening to the default message')
      .then(() => console.log('Success'))
      .catch((reason: any) => console.log(reason));
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      showCloseButton: false,
      position: 'bottom',
      closeButtonText: 'Done'
    });
    toast.present();
  }

  isIos() {
    return this.plt.is('ios');
  }

  stopListening() {
    this.speechRecognition.stopListening().then(() => {
      this.isRecording = false;
      this.speakstate='mic';
    });
  }
  
  startListening() {
    let options = {
      language: 'en-IN'
    }
    this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speechRecognition.requestPermission();
        }
    });
    this.speechRecognition.startListening(options).subscribe(matches => {
      this.speech_text = matches[0];
      this.speakstate='mic';
      this.cd.detectChanges();
    });
    this.isRecording = true;
    this.speakstate='mic-off';
  }
}
