import { Component } from '@angular/core';
import { IonicPage, NavController, Platform } from 'ionic-angular';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { GetdataProvider } from '../../providers/getdata/getdata';

/**
 * Generated class for the DashboardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html',
})
export class DashboardPage {

  task_index  = { 1: 'ASK_NAME', 2: 'ASK_AGE'};

  isRecording = false;
  speakstate = 'mic';
  speech_text: string = '';

  account: any;
  account_profile: any;
  
  constructor(public navCtrl: NavController,
              private tts: TextToSpeech,
              private speechRecognition: SpeechRecognition,
              private plt: Platform,
              private getdataProvider:GetdataProvider,
  ) { 
    plt.ready().then(() => {
      this.account = JSON.parse(localStorage.getItem('LOOK_USER'));
      this.account_profile = JSON.parse(localStorage.getItem('LOOK_USER_PROFILE'));
      this.createProfile();
    });
  }

  createProfile()
  {
    if(this.account.first_name)
    {
      if(this.account_profile.age)
      {
        this.speak(3, 'You are logged in. Your profile is all set up. Say Log me Out when you desire to logout.', false, 5000)
      }
      else
        this.askAge();
    }
    else
      this.askName();
  }

  async askName()
  {
    this.speak(1, 'What is your name?', false, 4000);
    await this.delay(3000);
    this.startListening(1);
  }

  storeName(name)
  {
    this.getdataProvider.storeUserProfileDetails('NAME', name, this.account).subscribe(
      (response) => {
        var resp = JSON.parse(response.text());
        var account_data = resp['account_data']
        this.account = account_data;

        localStorage.setItem('LOOK_USER', JSON.stringify(account_data));
        this.askAge();
      },
      (error) =>{
        var err = JSON.parse(error.text());
        var error_message = err['error'];
        this.speak(2, error_message, false, 3000);
      });
  }

  async askAge()
  {
    this.speak(2, 'What is your age?', false, 3000);
    await this.delay(3000);
    this.startListening(2);
  }

  storeAge(age)
  {
    this.getdataProvider.storeUserProfileDetails('AGE', age, this.account).subscribe(
      (response) => {
        var resp = JSON.parse(response.text());
        var account_profile = resp['account_profile']
        this.account_profile = account_profile;

        localStorage.setItem('LOOK_USER_PROFILE', JSON.stringify(account_profile));
        this.createProfile();
      },
      (error) =>{
        var err = JSON.parse(error.text());
        var error_message = err['error'];
        this.speak(2, error_message, false, 2000);
      });
  }

  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  async speak(task_index, message, listen_again, delay_in_ms)
  {
    this.tts.speak(message)
      .catch((reason: any) => console.log(reason));
    await this.delay(delay_in_ms);
    if(listen_again)
      this.startListening(task_index);
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
    this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speechRecognition.requestPermission();
        }
    });
    if(!this.isRecording){
      this.isRecording = true;
      this.speechRecognition.startListening(options).subscribe(matches => {
        
        this.speechRecognition.stopListening();
        this.isRecording = false;

        // console.log(matches);
        this.speech_text = matches[0];
        this.speakstate='mic';
        if(task_index == 1)
          this.storeName(this.speech_text);
        if(task_index == 2)
        {
          if(isNaN(+this.speech_text))
            this.speak(2, 'This is not a number. Please state your age.', true, 5000);
          else
            this.storeAge(this.speech_text);
        }
      });
    }
    else{

    }
    this.isRecording = true;
    this.speakstate='mic-off';
    return this.speech_text;
  }

}
