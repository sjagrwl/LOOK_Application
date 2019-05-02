import { Injectable } from '@angular/core';
import { Http } from '@angular/http' ;
import "rxjs/add/operator/map";
/*
  Generated class for the GetdataProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GetdataProvider {

    // base_url = 'http://10.0.54.79:8000';
    // base_url = 'http://10.0.55.44:8000';
    // base_url = 'http://10.0.55.168:8000';
    // base_url = 'http://10.0.49.211:8000';
    base_url = 'http://10.0.32.162:8000';
    
    constructor(public http: Http) {
        console.log('Hello GetdataProvider Provider');
        localStorage.setItem('LOOK_base_url', this.base_url);
    }

    getOTPsignup(data: any)
    {
        return this.http.post(this.base_url+'/userauth/getOTPsignup/', data);
    }

    signUp(data: any)
    {
        return this.http.post(this.base_url+'/userauth/signup/', data);
    }

    loginAlreadyRegisterdUser(data: any)
    {
        return this.http.post(this.base_url+'/api-token-auth/', data);
    }

    storeUserProfileDetails(task_index: any, value: any, account: any)
    {
        var data = { 'task_index': task_index, 'value': value, 'account': account }
        return this.http.post(this.base_url+'/userauth/store-userprofile-data/', data);
    }

    getImagesSession(account_profile: any, headers: any)
    {
        var data = { 'account_profile': account_profile }
        return this.http.post(this.base_url+'/imagedesc/get-imagessession/', data);
    }

    getLatestImageCaptions(account: any, account_profile: any, headers: any)
    {
        var data = { 'account': account, 'account_profile': account_profile };
        return this.http.post(this.base_url+'/imagedesc/get-image-caption/', data);
    }

    askQuestion(account: any, account_profile: any, question: any, headers: any)
    {
        var data = { 'account': account, 'account_profile': account_profile, 'question': question };
        return this.http.post(this.base_url+'/imagedesc/ask-question/', data);
    }
}
