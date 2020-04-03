import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DateDetailConditionPageRoutingModule } from './date-detail-condition-routing.module';

import { DateDetailConditionPage } from './date-detail-condition.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DateDetailConditionPageRoutingModule,
    TranslateModule,
  ],
  declarations: [DateDetailConditionPage],
  exports: [DateDetailConditionPage],
})
export class DateDetailConditionPageModule {}