import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LoadingModule } from '../../utils/loading/loading.module';

const routes = [
    { path: '', pathMath: 'full', component: ProfileComponent }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        LoadingModule
    ],
    exports: [
        RouterModule
    ],
    declarations: [ProfileComponent]
})

export class ProfileModule {
}


