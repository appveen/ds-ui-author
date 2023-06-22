import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntityGuard } from '../utils/guards/entity.guard';
import { BuilderGuard } from '../utils/guards/builder.guard';
import { LibraryGuard } from '../utils/guards/library.guard';
import { ControlPanelGuard } from '../utils/guards/control-panel.guard';
import { AppsComponent } from 'src/app/apps/apps.component';
import { BeforeGuard } from '../utils/guards/before.guard';
import { DataFormatGuard } from '../utils/guards/data-format.guard';
import { AgentGuard } from '../utils/guards/agent.guard';
import { AppPanelGuard } from '../utils/guards/app-panel.guard';
import { BotGuard } from '../utils/guards/bot.guard';
import { InsightsGuard } from '../utils/guards/insights.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: AppsComponent },
  {
    path: ':app',
    component: AppsComponent,
    canActivate: [BeforeGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'sm',
      },
      {
        path: 'cp',
        loadChildren: () =>
          import('../home/control-panel/control-panel.module').then(
            (m) => m.ControlPanelModule
          ),
        canActivate: [ControlPanelGuard],
      },
      {
        path: 'sm',
        loadChildren: () =>
          import('../home/service-manager/service-manager.module').then(
            (m) => m.ServiceManagerModule
          ),
        canActivate: [EntityGuard],
      },
      {
        path: 'sb/:id',
        loadChildren: () =>
          import('../home/schema-builder/schema-builder.module').then(
            (m) => m.SchemaBuilderModule
          ),
        canActivate: [BuilderGuard],
      },
      {
        path: 'lib',
        loadChildren: () =>
          import('../home/library/library.module').then((m) => m.LibraryModule),
        canActivate: [LibraryGuard],
      },
      {
        path: 'gs/:id',
        loadChildren: () =>
          import('../home/global-schemas/global-schemas.module').then(
            (m) => m.GlobalSchemasModule
          ),
        canActivate: [LibraryGuard],
      },
      {
        path: 'dfl',
        loadChildren: () =>
          import('../home/data-format-listing/data-format-listing.module').then(
            (m) => m.DataFormatListingModule
          ),
        canActivate: [DataFormatGuard],
      },
      {
        path: 'dfm/:id',
        loadChildren: () =>
          import('../home/data-format-manage/data-format-manage.module').then(
            (m) => m.DataFormatManageModule
          ),
        canActivate: [DataFormatGuard],
      },
      {
        path: 'agent',
        loadChildren: () =>
          import('../home/agents/agents.module').then((m) => m.AgentsModule),
        canActivate: [AgentGuard],
      },
      {
        path: 'insight',
        loadChildren: () =>
          import('../home/insight/insight.module').then((m) => m.InsightModule),
        canActivate: [InsightsGuard],
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('../home/profile/profile.module').then((m) => m.ProfileModule),
      },
      {
        path: 'bots',
        loadChildren: () =>
          import('../home/bots/bots.module').then((m) => m.BotsModule),
        canActivate: [BotGuard],
      },
      {
        path: 'local-bots',
        loadChildren: () =>
          import('../home/local-bot/local-bot.module').then(
            (m) => m.LocalBotModule
          ),
        canActivate: [BotGuard],
      },
      {
        path: 'noAccess',
        loadChildren: () =>
          import('../home/no-access/no-access.module').then(
            (m) => m.NoAccessModule
          ),
      },
      {
        path: 'app',
        loadChildren: () =>
          import('../home/app-manage/app-manage.module').then(
            (m) => m.AppManageModule
          ),
        canActivate: [AppPanelGuard],
      },
      {
        path: 'faas',
        loadChildren: () =>
          import('../home/faas/faas.module').then((m) => m.FaasModule),
      },
      {
        path: 'flow',
        loadChildren: () =>
          import('../home/b2b-flows/b2b-flows.module').then(
            (m) => m.B2bFlowsModule
          ),
      },
      {
        path: 'flow/:id',
        loadChildren: () =>
          import('../home/b2b-flows-manage/b2b-flows-manage.module').then(
            (m) => m.B2bFlowsManageModule
          ),
      },
      {
        path: 'con',
        loadChildren: () =>
          import('../home/connectors/connectors.module').then(
            (m) => m.ConnectorsModule
          ),
      },
      {
        path: 'con/:id',
        loadChildren: () =>
          import('../home/connectors-manage/connectors-manage.module').then(
            (m) => m.ConnectorsManageModule
          )
      },
      {
        path: 'api-keys',
        loadChildren: () =>
          import('../home/api-keys/api-keys.module').then(
            (m) => m.ApiKeysModule
          ),
      },
      {
        path: 'processNode',
        loadChildren: () =>
          import('../home/nodes/nodes.module').then(
            (m) => m.NodesModule
          )
      },
      {
        path: 'processNode/:id',
        loadChildren: () =>
        import('../home/nodes/node-details/node-details.module').then(
          (m) => m.NodeDetailsModule
          )
      },
      {
        path: 'processFlow',
        loadChildren: () =>
          import('../home/process-flows/process-flows.module').then(
            (m) => m.ProcessFlowsModule
          ),
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppsRoutingModule { }
