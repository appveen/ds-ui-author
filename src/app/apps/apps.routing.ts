import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntityGuard } from '../utils/guards/entity.guard';
import { BuilderGuard } from '../utils/guards/builder.guard';
import { LibraryGuard } from '../utils/guards/library.guard';
import { ControlPanelGuard } from '../utils/guards/control-panel.guard';
import { AppsComponent } from 'src/app/apps/apps.component';
import { PartnerGuard } from '../utils/guards/partner.guard';
import { BeforeGuard } from '../utils/guards/before.guard';
import { DataFormatGuard } from '../utils/guards/data-format.guard';
import { AgentGuard } from '../utils/guards/agent.guard';
import { NanoServiceGuard } from '../utils/guards/nano-service.guard';
import { AppPanelGuard } from '../utils/guards/app-panel.guard';
import { BotGuard } from '../utils/guards/bot.guard';
import { InsightsGuard } from '../utils/guards/insights.guard';

const routes: Routes = [
    { path: '', pathMatch: 'full', component: AppsComponent },
    {
        path: ':app', component: AppsComponent,
        canActivate: [BeforeGuard],
        children: [
            {
                path: '',
                pathMatch: 'full', redirectTo: 'sm'
            },
            {
                path: 'cp',
                loadChildren: () => import('../home/control-panel/control-panel.module').then(m => m.ControlPanelModule),
                canActivate: [ControlPanelGuard]
            },
            {
                path: 'sm',
                loadChildren: () => import('../home/service-manager/service-manager.module').then(m => m.ServiceManagerModule),
                canActivate: [EntityGuard]
            },
            {
                path: 'sb/:id',
                loadChildren: () => import('../home/schema-builder/schema-builder.module').then(m => m.SchemaBuilderModule),
                canActivate: [BuilderGuard]
            },
            {
                path: 'sb/:id/:stateModel',
                loadChildren: () => import('../home/schema-builder/schema-builder.module').then(m => m.SchemaBuilderModule),
                canActivate: [BuilderGuard]
            },
            {
                path: 'lib',
                loadChildren: () => import('../home/library/library.module').then(m => m.LibraryModule),
                canActivate: [LibraryGuard]
            },
            {
                path: 'gs/:id',
                loadChildren: () => import('../home/global-schemas/global-schemas.module').then(m => m.GlobalSchemasModule),
                canActivate: [LibraryGuard]
            },
            {
                path: 'pm',
                loadChildren: () => import('../home/partner-listing/partner-listing.module').then(m => m.PartnerListingModule),
                canActivate: [PartnerGuard]
            },
            {
                path: 'po/:id',
                loadChildren: () => import('../home/partner-onboard/partner-onboard.module').then(m => m.PartnerOnboardModule),
                canActivate: [PartnerGuard]
            },
            {
                path: 'dfl',
                loadChildren: () => import('../home/data-format-listing/data-format-listing.module').then(m => m.DataFormatListingModule),
                canActivate: [DataFormatGuard]
            },
            {
                path: 'dfm/:id',
                loadChildren: () => import('../home/data-format-manage/data-format-manage.module').then(m => m.DataFormatManageModule),
                canActivate: [DataFormatGuard]
            },
            {
                path: 'nsl',
                loadChildren: () => import('../home/nano-service-listing/nano-service-listing.module').then(m => m.NanoServiceListingModule),
                canActivate: [NanoServiceGuard]
            },
            {
                path: 'nsm/:id',
                loadChildren: () => import('../home/nano-service-manage/nano-service-manage.module').then(m => m.NanoServiceManageModule),
                canActivate: [NanoServiceGuard]
            },
            {
                path: 'agent',
                loadChildren: () => import('../home/agents/agents.module').then(m => m.AgentsModule),
                canActivate: [AgentGuard]

            },
            {
                path: 'insight',
                loadChildren: () => import('../home/insight/insight.module').then(m => m.InsightModule),
                canActivate: [InsightsGuard]
            },
            {
                path: 'profile',
                loadChildren: () => import('../home/profile/profile.module').then(m => m.ProfileModule)
            },
            {
                path: 'bots',
                loadChildren: () => import('../home/bots/bots.module').then(m => m.BotsModule),
                canActivate: [BotGuard]
            },
            {
                path: 'local-bots',
                loadChildren: () => import('../home/local-bot/local-bot.module').then(m => m.LocalBotModule),
                canActivate: [BotGuard]
            },
            {
                path: 'noAccess',
                loadChildren: () => import('../home/no-access/no-access.module').then(m => m.NoAccessModule)
            },
            {
                path: 'app',
                loadChildren: () => import('../home/app-manage/app-manage.module').then(m => m.AppManageModule),
                canActivate: [AppPanelGuard]
            },
            {
                path: 'faas',
                loadChildren: () => import('../home/faas/faas.module').then(m => m.FaasModule),
            },
        ]
    },
];
@NgModule(
    {
        imports: [
            RouterModule.forChild(routes)
        ],
        exports: [
            RouterModule
        ]
    }
)

export class AppsRoutingModule { }
