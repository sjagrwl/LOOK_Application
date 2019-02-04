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

    // base_url = 'http://10.0.32.241:8000';
    base_url = 'http://192.168.43.145:9999';
    
    constructor(public http: Http) {
        console.log('Hello GetdataProvider Provider');
        localStorage.setItem('LOOK_base_url', this.base_url);
    }

    signUp(data: any)
    {
        return this.http.post(this.base_url+'/userauth/signup/', data);
    }

    storeUserProfileDetails(task_index: any, value: any, account: any)
    {
        var data = { 'task_index': task_index, 'value': value, 'account': account }
        return this.http.post(this.base_url+'/userauth/store-userprofile-data/', data);
    }
}
