import { Component, OnInit, Input } from '@angular/core';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-agents-hb',
  templateUrl: './agents-hb.component.html',
  styleUrls: ['./agents-hb.component.scss']
})
export class AgentsHbComponent implements OnInit {

  @Input() agent: any;
  constructor(private commonService: CommonService) { }

  ngOnInit(): void {
    const self = this;
    if (self.agent.agentId) {
      self.agent.agentID = self.agent.agentId;
    } else if (self.agent.agentID) {
      self.agent.agentId = self.agent.agentID;
    }
    self.getHeartbeats();
  }

  getHeartbeats() {
    const self = this;
    const options: GetOptions = {
      select: 'timestamp,heartBeatFrequency,status,release,pendingFiles',
      filter: {
        agentID: self.agent.agentID
      },
      count: 5,
      sort: '-timestamp',
      noApp: true
    };
    self.commonService.get('partnerManager', `/${this.commonService.app._id}/agent/utils/heartbeats`, options).subscribe(res => {
      if (res.length === 0) {
        self.agent.heartbeat = -1;
        self.agent.streak = [];
        self.agent.pendingFiles = 0;
        self.agent.release = null;
      } else {
        self.agent.heartbeat = res[0].heartBeatFrequency;
        self.agent.streak = res.map(e => e.status === 'RUNNING' ? 'T' : 'F').reverse();
        self.agent.release = res[0].release;
        if (res[0].pendingFiles && Array.isArray(res[0].pendingFiles)) {
          self.agent.pendingFiles = res[0].pendingFiles.reduce((p, c) => p + c.count, 0);
        }
      }
    }, err => {
      self.agent.heartbeat = -1;
      self.agent.streak = [];
    });
  }

  getStrength(streak: Array<string>) {
    if (streak && streak.length > 0) {
      const successLen = streak.filter(e => e === 'T').length;
      if (successLen === streak.length || successLen === streak.length - 1) {
        return 'high';
      }
      if (successLen === streak.length - 2 || successLen === streak.length - 3) {
        return 'medium';
      }
    }
    return 'low';
  }

}
