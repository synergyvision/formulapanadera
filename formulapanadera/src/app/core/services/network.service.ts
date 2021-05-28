import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { Plugins, NetworkStatus, PluginListenerHandle } from '@capacitor/core';
import { LanguageService } from './language.service';
import { ICONS } from 'src/app/config/icons';
import { ConnectionStatus } from '../enums/connection-status.enum';

const { Network } = Plugins;
 
@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private networkStatus: BehaviorSubject<ConnectionStatus | null> = new BehaviorSubject(null);
  networkListener: PluginListenerHandle;
 
  constructor(
    private languageService: LanguageService,
    private toastController: ToastController,
    private zone: NgZone
  ) { }
 
  public async initializeNetworkEvents() {
    let initialStatus = await Network.getStatus();
    this.updateNetworkStatus(initialStatus.connected ? ConnectionStatus.Online : ConnectionStatus.Offline);

    this.networkListener = Network.addListener('networkStatusChange', (status: NetworkStatus) => {
      this.zone.run(() => {
        if (!status.connected && this.isConnectedToNetwork()) {
          this.updateNetworkStatus(status.connected ? ConnectionStatus.Online : ConnectionStatus.Offline);
        }
        if (status.connected && !this.isConnectedToNetwork()) {
          // We just got a connection but we need to wait briefly
          // before we determine the connection type. Might need to wait.
          // prior to doing any api requests as well.
          setTimeout(() => {
            this.updateNetworkStatus(status.connected ? ConnectionStatus.Online : ConnectionStatus.Offline);
          }, 3000);
        }
      })
    });
  }
 
  private async updateNetworkStatus(status: ConnectionStatus) {
    let connection = status == ConnectionStatus.Online ? this.languageService.getTerm("connection.online") : this.languageService.getTerm("connection.offline");
    let toast = this.toastController.create({
      message: `${connection}`,
      color: "secondary",
      duration: 3000,
      position: 'top',
      animated: false,
      buttons: [
        {
          icon: ICONS.close,
          role: "cancel",
          handler: () => {},
        },
      ],
    });
    if (this.networkStatus.getValue() != null) {
      toast.then((toast) => { toast.present(); })
    }
    this.networkStatus.next(status);
  }

  public async removeNetworkStatus() {
    this.networkListener.remove();
  }
 
  public onNetworkChange(): Observable<ConnectionStatus> {
    return this.networkStatus.asObservable();
  }
 
  public isConnectedToNetwork(): boolean {
    return this.networkStatus.getValue() == ConnectionStatus.Online;
  }
}