import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { PrivateCouponService } from '@numbersprotocol/private-coupon';
import { Subject } from 'rxjs';
import { first, map, switchMap, tap } from 'rxjs/operators';
import { DataStoreService } from '../core/services/data-store.service';
import { TranslateConfigService } from '../core/services/translate-config.service';

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

  private destroy$ = new Subject();

  constructor(
    public translateConfigService: TranslateConfigService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private dataStoreService: DataStoreService,
    private privateCouponService: PrivateCouponService
  ) { }

  onSubmit() {
    this.dataStoreService.userData$.pipe(
      first(),
      tap(() => this.confirmButtonEnabled = false),
      map(userData => {
        userData.email = this.onboardingForm.controls.email.value;
        userData.newUser = false;
        return userData;
      }),
      switchMap(userData => this.dataStoreService.updateUserData(userData)),
      switchMap(userData => this.privateCouponService.signup(userData.email))
    ).subscribe(() => {
      this.router.navigate(['/']);
    }, (error: HttpErrorResponse) => {
      this.confirmButtonEnabled = true;
      console.error(error);
      this.presentToast(error.error.reason || error.statusText);
    });
  }

  private presentToast(message: string) {
    this.toastController.create({
      message,
      duration: 3000
    }).then(toast => toast.present());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
