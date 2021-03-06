import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Platform, Content } from 'ionic-angular';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions, CameraPreviewDimensions } from '@ionic-native/camera-preview';

import { GetdataProvider } from '../../providers/getdata/getdata';
import { TakePicturePage } from '../take-picture/take-picture';

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

  @ViewChild(Content) contentArea: Content;

  task_index  = { 1: 'ASK_NAME', 2: 'ASK_AGE', 3: 'PROFILE_COMPLETE', 4:'IMAGE_CAPTION', 5:'QUESTION_ANSWER'};

  isRecording = false;
  speakstate = 'mic';
  speech_text: string = '';
  message_in_text_box = '';
  headers: any;

  account: any;
  account_profile: any;

  chats: Object[];

  new_picture_taken: any;

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
              private plt: Platform,
              private getdataProvider:GetdataProvider,
              private cameraPreview: CameraPreview
  ) { 
    plt.ready().then(() => {
      this.chats = [];
      this.openCameraButton();
      this.account = JSON.parse(localStorage.getItem('LOOK_USER'));
      this.account_profile = JSON.parse(localStorage.getItem('LOOK_USER_PROFILE'));
      this.headers = new Headers({ 'Authorization': localStorage.getItem('LOOK_USER_JWT') });
      // this.account.first_name = "";
      // this.account_profile.age = "";
      this.createProfile();
      // console.log(JSON.stringify(this.account));
      // console.log(JSON.stringify(this.account_profile));

      this.new_picture_taken = false;
    });
  }

  ionViewDidEnter()
  {
    if(this.new_picture_taken)
    {
      this.getdataProvider.getLatestImageCaptions(this.account, this.account_profile, this.headers).subscribe(
        (response) => {
          this.scrollToBottom();
          this.chats = [];
          // console.log(response.text());
          var data = JSON.parse(response.text())['captions'];
          console.log(JSON.stringify(data))
          var i = 0;
          this.scrollToBottom();
          for(i=0; i<data.length; i++)
          {
            this.add_to_chats(4, "LOOK", null, data[i], "String", null);
          }
          this.speak_chats(4);
          this.scrollToBottom();
        },
        (error) =>{
        });
    }
    
  }

  speak_chats(task_index)
  {
    var i=0; 
    var whole_chat = '';
    for(i=0; i<this.chats.length; i++)
      // this.speak(1, 'What is your name?', false, 4000);
      whole_chat += this.chats[i]['message'] + ". ";
    // console.log(whole_chat);
    this.scrollToBottom();
    this.speak(task_index, whole_chat, false, 2000);
    this.scrollToBottom();
  }

  askQuestion(question)
  {
    this.getdataProvider.askQuestion(this.account, this.account_profile, question, this.headers).subscribe(
      (response) => {
        this.scrollToBottom();
        var data = JSON.parse(response.text())['answer'];
        console.log(data);
        this.speak(5, data, false, 4000);
        this.add_to_chats(5, "LOOK", null, data, "String", null);
      },
      (error) =>{
      });
  }

  openCameraButton() {
    this.cameraPreview.startCamera(this.cameraPreviewOpts).then(
      (res) => {
        this.cameraPreview.show();
      },
      (err) => {
        this.cameraPreview.show();
      });
    
  }

  stopCameraButton() {
    this.cameraPreview.stopCamera();
    this.cameraPreview.hide();
  }

  TakePicture()
  {
    // console.log('TAKING PICTURE');
    this.new_picture_taken = true;
    this.navCtrl.push(TakePicturePage);
  }

  add_to_chats(task_index, author, author_id, message, type, url)
  {
    console.log('add to chats', message);
    this.chats.push({
      task_index: task_index,
      author: author,
      author_id: author_id,
      message: message,
      type: type,
      url: url
    });
  }

  createProfile()
  {
    if(this.account.first_name)
    {
      if(this.account_profile.age)
      {
        this.speak(3, 'You are logged in. Your profile is all set up. Say Log me Out when you desire to logout.', false, 5000);
        this.add_to_chats(3, "LOOK", null, 'You are logged in. Your profile is all set up. Say Log me Out when you desire to logout.', "String", null);
        this.scrollToBottom();
      }
      else
        this.askAge();
        this.scrollToBottom();
    }
    else
      this.askName();
      this.scrollToBottom();
  }

  async askName()
  {
    this.speak(1, 'What is your name?', false, 4000);
    this.add_to_chats(1, "LOOK", null, 'What is your name?', "String", null);
    await this.delay(3000);
    this.startListening(1);
    this.scrollToBottom();
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
        this.scrollToBottom();
      },
      (error) =>{
        var err = JSON.parse(error.text());
        var error_message = err['error'];
        this.speak(2, error_message, false, 3000);
        this.scrollToBottom();
      });
  }

  async askAge()
  {
    this.speak(2, 'What is your age?', false, 3000);
    this.add_to_chats(1, "LOOK", null, 'What is your age?', "String", null);
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
    console.log(this.task_index);
    console.log(JSON.stringify(this.chats));
    let options = {
      language: 'en-IN'
    }
    this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speechRecognition.requestPermission();
        }
    });
      this.isRecording = true;
      this.speechRecognition.startListening(options).subscribe(matches => {
        
        this.speechRecognition.stopListening();
        this.isRecording = false;

        // console.log(matches);
        this.speech_text = matches[0];
        this.speakstate='mic';
        if(this.speech_text.toLowerCase() == 'look')
        {
          this.TakePicture();
        }
        else if(task_index == 1)
        {
          this.storeName(this.speech_text);
          this.add_to_chats(1, "LOOK_USER", this.account.username, this.speech_text, "String", null);
          this.scrollToBottom();
        }
        else if(task_index == 2)
        {
          this.scrollToBottom();
          if(isNaN(+this.speech_text))
          {
            this.speak(2, 'This is not a number. Please state your age.', true, 5000);
            this.add_to_chats(1, "LOOK", null, 'This is not a number. Please state your age.', "String", null);
            this.scrollToBottom();
          }
          else
          {
            this.add_to_chats(1, "LOOK_USER", this.account.username, this.speech_text, "String", null);
            this.storeAge(this.speech_text);
            this.scrollToBottom();
          }
        }
        else if(task_index == 5)
        {
          this.scrollToBottom();
          this.add_to_chats(1, "LOOK_USER", this.account.username, this.speech_text, "String", null);
          this.scrollToBottom();
          this.askQuestion(this.speech_text);
        }
      });
    this.isRecording = true;
    this.speakstate='mic-off';
    this.scrollToBottom();
    return this.speech_text;
  }

  scrollToBottom()
  {
    this.contentArea.scrollToBottom();
  }

  sendTypedMessage(task_index)
  {
    if(task_index == 1)
    {
      this.storeName(this.message_in_text_box);
      this.add_to_chats(1, "LOOK_USER", this.account.username, this.message_in_text_box, "String", null);
      this.scrollToBottom();
    }
    if(task_index == 2)
    {
      this.scrollToBottom();
      if(isNaN(+this.message_in_text_box))
      {
        this.speak(2, 'This is not a number. Please state your age.', true, 5000);
        this.add_to_chats(2, "LOOK", null, 'This is not a number. Please state your age.', "String", null);
        this.scrollToBottom();
      }
      else
      {
        this.add_to_chats(2, "LOOK_USER", this.account.username, this.message_in_text_box, "String", null);
        this.storeAge(this.message_in_text_box);
        this.scrollToBottom();
      }
    }
    this.scrollToBottom();
  }

}
