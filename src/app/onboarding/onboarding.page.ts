import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { PrivateCouponService } from '@numbersprotocol/private-coupon';
import { Subject, forkJoin, defer, of, from, Observable } from 'rxjs';
import { first, map, switchMap, tap, catchError } from 'rxjs/operators';
import { DataStoreService } from '../core/services/data-store.service';
import { TranslateConfigService } from '../core/services/translate-config.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
})
export class OnboardingPage implements OnDestroy {

  onboardingForm = this.formBuilder.group({
    email: ['', [Validators.email, Validators.required]],
    agreeTermsAndConditions: [false, Validators.requiredTrue]
  });
  confirmButtonEnabled = true;
  private loadingElement: HTMLIonLoadingElement;

  private readonly destroy$ = new Subject();

  constructor(
    public translateConfigService: TranslateConfigService,
    private readonly translate: TranslateService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly toastController: ToastController,
    private readonly dataStoreService: DataStoreService,
    private readonly privateCouponService: PrivateCouponService,
    private readonly loadingCtrl: LoadingController,
  ) { }

  onSubmit() {
    this.confirmButtonEnabled = false;
    const loading$ = this.presentLoading();
    const signup$ = this.privateCouponService.signup(this.onboardingForm.controls.email.value)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.error.reason === 'USED_EMAIL') {
            console.log('The API returns USED_EMAIL error.');
            return of(null);
          }
          console.error(err);
          this.confirmButtonEnabled = true;
          this.presentToast(err.error.reason || err.statusText);
          throw (err);
        }),
        switchMap((res: SignupResponse) => {
          const userData = this.dataStoreService.getUserData();
          userData.email = this.onboardingForm.controls.email.value;
          userData.newUser = false;
          if (res) {
            userData.userId = res.response.user_id;
          }
          return this.dataStoreService.updateUserData(userData);
        }),
      );

    loading$
      .pipe(
        tap(loadingElement => this.loadingElement = loadingElement),
        switchMap(loadingElement => signup$.pipe(map(() => loadingElement))),
        switchMap(loadingElement => loadingElement.dismiss()),
      )
      .subscribe(() => {
        this.router.navigate(['/']);
      }, () => {
        this.loadingElement.dismiss();
      });
  }

  private presentToast(message: string) {
    this.toastController.create({
      message,
      duration: 3000
    }).then(toast => toast.present());
  }

  private presentLoading(): Observable<HTMLIonLoadingElement> {
    return this.translate.get('description.registeringUser')
      .pipe(
        switchMap(msg => {
          return defer(() => this.loadingCtrl.create({
            message: msg,
            duration: 10000,
          }));
        }),
        switchMap(loading => from(loading.present())
          .pipe(
            map(() => loading),
          )),
      );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

export interface SignupResponse {
  status: string;
  response: {
    expires: number;
    token: string;
    user_id: string;
  };
}
