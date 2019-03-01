import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, ToastController, Platform, Content } from 'ionic-angular';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { Sim } from '@ionic-native/sim';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions, CameraPreviewDimensions } from '@ionic-native/camera-preview';

import { GetdataProvider } from '../../providers/getdata/getdata';
import { DashboardPage } from '../dashboard/dashboard';

declare let cordova: any;


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild(Content) contentArea: Content;

  task_index  = { 1: 'INTRODUCTION', 2: 'LOGIN'};
  sim_information: any;
  otp: any;

  isRecording = false;
  speakstate = 'mic';
  speech_text: string = '';

  account = { mobile_no: '', name: '', age: '', gender: '' };
  login_account = { username: '', password: '' };
  account_profile: any;
  account_data: any;

  new_message: any;
  chats: Object[];
  message_in_text_box: any;

  cameraPreviewOpts: CameraPreviewOptions = {
    x: 0,
    y: 0,
    width: window.screen.width,
    height: window.screen.height,
    camera: 'rear',
    tapPhoto: true,
    previewDrag: true,
    toBack: true,
    alpha: 1
  };

  constructor(public navCtrl: NavController,
              private tts: TextToSpeech,
              private speechRecognition: SpeechRecognition,
              public toastCtrl: ToastController,
              private plt: Platform,
              private getdataProvider:GetdataProvider,
              private sim: Sim,
              private cameraPreview: CameraPreview
  ) { 
    this.chats = [];
    plt.ready().then(() => {
      this.seekMicroPhonePermission('Hello, Welcome to Look. A voice based app for the blind. This app requires Microphone Permission to record audio');
      // this.add_to_chats(1, "LOOK", null, 'Hello, Welcome to Look. A voice based app for the blind. This app requires Microphone Permission to record audio', "String", null);
      this.openCameraButton();
    });
  }

  openCameraButton() {
    this.cameraPreview.startCamera(this.cameraPreviewOpts).then(
      (res) => {
        console.log('here', res);
        this.cameraPreview.show();
      },
      (err) => {
        console.log('here 2', err);
        this.cameraPreview.show();
      });
    
  }

  stopCameraButton() {
    this.cameraPreview.stopCamera();
    this.cameraPreview.hide();
  }

  add_to_chats(task_index, author, author_id, message, type, url)
  {
    this.chats.push({
      task_index: task_index,
      author: author,
      author_id: author_id,
      message: message,
      type: type,
      url: url
    });
    
    // this.chatList.nativeElement.style.height = this.chatList.nativeElement.scrollHeight + 'px';
    console.log(JSON.stringify(this.chats));
  }

  scrollToBottom()
  {
    this.contentArea.scrollToBottom();
  }

  async login()
  {
    this.speak(2, 'Hello, Welcome to Look. Please state your 10 digit mobile number to login', false);
    this.add_to_chats(2, "LOOK", null, 'Hello, Welcome to Look. Please state your 10 digit mobile number to login', String, null);
    await this.delay(3000);
    this.account.mobile_no = this.startListening(2);
  }

  seekSimPermission(message)
  {
    this.sim.hasReadPermission()
    .then((hasPermission: boolean) => {
      if(!hasPermission){
        this.speak(0, message, false);
        this.sim.requestReadPermission().then(
          (success) => {
            this.speak(0, 'Thanks for permitting Look', false);
            this.sim.getSimInfo().then(
              (info) => {
                this.sim_information = info;
                console.log('Sim info: ', JSON.stringify(info));
              },
              (err) => {
            });
            this.login();
          },
          (error) => {
            this.seekSimPermission('Please allow Look to manage phone calls.')
          });
      }
      else{
        this.sim.getSimInfo().then(
          (info) => {
            this.sim_information = info;
          },
          (err) => {
        });
        this.login();
      }
    });
  }

  seekMicroPhonePermission(message)
  {
    this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speak(0, message, false)
          this.speechRecognition.requestPermission().then(
            (success) => {
              this.speak(0, 'Thanks for permitting Look', false);
              this.seekSimPermission('This app requires permission to manage phone calls.');
            },
            (error) => {
              this.seekMicroPhonePermission('Please grant permission to record audio.')
            });
        }
        else{
          this.seekSimPermission('This app requires permission to manage phone Calls.');
        }
    });
  }

  getOTPFromUser(message)
  {
    this.speak(0, message, false);
    return 1234;
  }

  ifMobileNumberInPhone(mobile_no)
  {
    return false;
  }

  getOTP(mobile_no)
  {
    this.account.mobile_no = mobile_no;
    if(this.sim_information)
    {
      if(this.ifMobileNumberInPhone(mobile_no))
      {
        this.signUp(mobile_no);
      }
      else
      {
        this.getdataProvider.getOTPsignup(this.account).subscribe(
          (response) => {
            var resp = JSON.parse(response.text());
            this.otp = parseInt(resp['OTP']);
            this.speak(0, resp['message'], false);
            if(this.otp == this.getOTPFromUser('Please Enter O T P'))
              this.signUp(this.account);
            else
              this.getOTPFromUser('Incorrect O T P')
          },
          (error) => {
            var err = JSON.parse(error.text());
          }
        )
      }
    }
    else
    {
      this.getdataProvider.getOTPsignup(this.account).subscribe(
        (response) => {
          var resp = JSON.parse(response.text());
          this.otp = resp['OTP'];
          if(this.otp == this.getOTPFromUser('Please Enter O T P'))
            this.signUp(this.account);
        },
        (error) => {
          var err = JSON.parse(error.text());
        }
      )
    }
  }

  signUp(mobile_no)
  {
    this.getdataProvider.signUp(this.account).subscribe(
      (response) => {
        var resp = JSON.parse(response.text());
        this.account_data = resp['account_data'];
        this.account_profile = resp['account_profile'];
        
        this.loginAlreadyRegisterdUser();
      },
      (error) =>{
      });
  }

  loginAlreadyRegisterdUser()
  {
    this.login_account.username = this.account_data.username;
    this.login_account.password = this.account_data.username;
    this.getdataProvider.loginAlreadyRegisterdUser(this.login_account).subscribe(
      (response) => {
        var resp = JSON.parse(response.text());
        var jwt = 'JWT '+resp['token'];

        localStorage.setItem('LOOK_USER', JSON.stringify(this.account_data));
        localStorage.setItem('LOOK_USER_PROFILE', JSON.stringify(this.account_profile));
        localStorage.setItem('LOOK_USER_JWT', jwt);

        this.navCtrl.setRoot(DashboardPage);
      },
      (error) =>{
        this.speak(0, 'Some Error Occurred while logging in.', false);
        this.login();
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
      this.speech_text = matches[0].split(" ").join("");
      this.speakstate='mic';
      if(task_index == 2)
      {
        if(this.speech_text.length != 10)
        {
          this.add_to_chats(2, "LOOK_USER", null, this.speech_text, "String", null);
          this.add_to_chats(2, "LOOK", null, "Phone Number must be 10 digits long.", "String", null);
          this.speak(2, 'Phone Number must be 10 digits long.', true);
          this.scrollToBottom();
        }
        else
        {
          this.add_to_chats(2, 'LOOK_USER', null, this.speech_text, "String", null);
          this.getOTP(this.speech_text);
          this.scrollToBottom();
        }
      }
    });
    this.isRecording = true;
    this.speakstate='mic-off';
    this.scrollToBottom();
    return this.speech_text;
  }

  sendTypedMessage()
  {
    if(this.message_in_text_box.length != 10)
    {
      this.add_to_chats(2, "LOOK_USER", null, this.message_in_text_box, "String", null);
      this.add_to_chats(2, "LOOK", null, "Phone Number must be 10 digits long.", "String", null);
      this.speak(2, 'Phone Number must be 10 digits long.', true);
      this.scrollToBottom();
    }
    else
    {
      this.add_to_chats(2, 'LOOK_USER', null, this.message_in_text_box, "String", null);
      this.getOTP(this.message_in_text_box);
      this.scrollToBottom();
    }
    this.scrollToBottom();
  }
}
