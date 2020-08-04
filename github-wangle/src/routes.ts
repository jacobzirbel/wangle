import { WelcomeComponent } from './app/full/welcome.component';
import { InitDataResolver, FullDataResolver } from './app/services/init-data-resolver.service';
import { HomeComponent } from './app/welcome/home/home.component';
import { AuthGuard } from './app/auth/auth.guard';
import { ToolsComponent } from './app/tools/tools.component';
import { ManageListsComponent } from './app/full/manage-lists/manage-lists.component';
import { AdminComponent } from './app/admin/admin.component';

export const appRoutes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
    {
        path: 'home',
        component: HomeComponent,
    },
    {
        path: 'find',
        component: WelcomeComponent,
        resolve: { initData: InitDataResolver },
    },
    {
        path: 'create',
        component: WelcomeComponent,
        resolve: { initData: InitDataResolver },
    },
    {
        path: 'view',
        component: WelcomeComponent,
        resolve: { initData: InitDataResolver },
    },
    { path: 'home', component: HomeComponent },
    {
        path: 'full',
        canActivate: [AuthGuard],
        resolve: { initData: FullDataResolver },
        children: [
            { path: '', component: WelcomeComponent },
            { path: 'lists', component: ManageListsComponent },
        ],
    },
    {
        path: 'tools',
        component: ToolsComponent,
    },
    { path: '**', pathMatch: 'full', redirectTo: 'home' },
];
