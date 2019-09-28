import { Component, ɵConsole } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, LoadingController, ToastController } from 'ionic-angular';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions, CameraPreviewDimensions } from '@ionic-native/camera-preview';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder';
import { TextToSpeech } from '@ionic-native/text-to-speech';

import { GetdataProvider } from '../../providers/getdata/getdata';
/**
 * Generated class for the TakePicturePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-take-picture',
  templateUrl: 'take-picture.html',
})
export class TakePicturePage {

  timerVar;
  timerVal=5;

  options = {
    x: 0,
    y: 0,
    width: window.screen.width,
    height: window.screen.height,
    camera: 'rear',
    toBack: false,
    tapPhoto: true,
    tapFocus: false,
    previewDrag: false,
    storeToFile: false,
    disableExifHeaderStripping: false
  };

  imageURI: any;
  imageFileName:any;
  allImages = [];

  LOOK_base_url: any;

  account: any;
  account_profile: any;
  headers: any;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private cameraPreview: CameraPreview,
              private plt: Platform,
              private transfer: FileTransfer,
              public loadingCtrl: LoadingController,
              public toastCtrl: ToastController,
              private geolocation: Geolocation,
              private nativeGeocoder: NativeGeocoder,
              private getdataProvider:GetdataProvider,
              private tts: TextToSpeech) {
      plt.ready().then(() => {
        this.openCameraPreview();
        this.account = JSON.parse(localStorage.getItem('LOOK_USER'));
        this.account_profile = JSON.parse(localStorage.getItem('LOOK_USER_PROFILE'));
        this.headers = new Headers({ 'Authorization': localStorage.getItem('LOOK_USER_JWT') });

        this.LOOK_base_url = localStorage.getItem('LOOK_base_url');

        console.log(JSON.stringify(this.account));
        console.log(JSON.stringify(this.account_profile));
        console.log(this.LOOK_base_url);
      });
  }

  openCameraPreview()
  {
    this.cameraPreview.startCamera(this.options).then(
      (res) => {
        this.cameraPreview.show();
      },
      (err) => {
        this.cameraPreview.show();
      });
  }

  takePicture()
  {
    this.cameraPreview.takePicture({width:640, height:640, quality: 100})
      .then((imageData) => {
        if(this.allImages.length == 0)
          this.startTimer();

        this.imageURI = 'data:image/jpeg;base64,' + imageData[0];
        this.allImages.push(this.imageURI);

      }, (err) => {
        this.presentToast(err);
      });
  }

  startTimer()
  {
    this.timerVar = Observable.interval(1000).subscribe( x=>{
      this.timerVal = 1;
      this.timerVal = this.timerVal - x;
      console.log(this.timerVal);

      if(this.timerVal < 1)
      {
        this.timerVar.unsubscribe();
        this.getImagesSession(this.allImages);
        // this.navCtrl.pop();
      }

      // let native_geolocation_options: NativeGeocoderOptions = {
      //   useLocale: true,
      //   maxResults: 5
      // };

      // this.geolocation.getCurrentPosition().then((resp) => {
      //   console.log(resp.coords.latitude);
      //   console.log(resp.coords.longitude);
      //   this.nativeGeocoder.reverseGeocode(resp.coords.latitude, resp.coords.longitude, native_geolocation_options)
      //     .then((result: NativeGeocoderReverseResult[]) => console.log('Location -- ', JSON.stringify(result[0])))
      //     .catch((error: any) => console.log(error));
      //   }).catch((error) => {
      //     console.log('Error getting location', error);
      //   });
    })
  }

  getImagesSession(all_images)
  {
    console.log(all_images.length);
    
    this.getdataProvider.getImagesSession(this.account_profile, this.headers).subscribe(
      (response) => {
          console.log(response.text());
          var data = JSON.parse(response.text());
          var image_session_id = data['image_session']['id'];
          
          let i = 0;
          for(i=0; i<1; i++)
          {
            this.uploadImage(image_session_id, all_images[i])
          }
      },
      (error) =>{
        var err = JSON.parse(error.text());
        var error_message = err['error'];
      });

    
  }

  uploadImage(image_session_id, image)
  {
    // let loader = this.loadingCtrl.create({
    //   content: "Uploading..."
    // });
    // loader.present();
    const fileTransfer: FileTransferObject = this.transfer.create();
  
    let options: FileUploadOptions = {
      fileKey: 'ionicfile',
      fileName: 'ionicfile',
      chunkedMode: false,
      mimeType: "image/jpeg",
      headers: {}
    }

    fileTransfer.upload(image, this.LOOK_base_url+'/imagedesc/store-images/'+image_session_id+'/', options)
      .then((data) => {
      // loader.dismiss();
      this.presentToast("Image uploaded successfully");
      this.speak(1, "Image Uploaded Successfully. Please wait while it is being analyzed.", false, 4000);
      this.navCtrl.pop();
    }, (err) => {
      // console.log(err);
      // loader.dismiss();
      // this.presentToast(err);
    });
  }

  async speak(task_index, message, listen_again, delay_in_ms)
  {
    this.tts.speak(message)
      .catch((reason: any) => console.log(reason));
    // await this.delay(delay_in_ms);
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    });
  
    toast.onDidDismiss(() => {
      // console.log('Dismissed toast');
    });
  
    toast.present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TakePicturePage');
  }

}
