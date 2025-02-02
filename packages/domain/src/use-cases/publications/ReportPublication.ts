import { success } from '@lens-protocol/shared-kernel';

import { ReportReason } from '../../entities';
import { IGenericResultPresenter } from '../transactions';

export type ReportPublicationRequest = {
  publicationId: string;
  reason: ReportReason;
  additionalComments?: string;
};

export interface IReportPublicationGateway {
  report(data: ReportPublicationRequest): Promise<void>;
}

export type IReportPublicationPresenter = IGenericResultPresenter<void, never>;

export class ReportPublication {
  constructor(
    private readonly gateway: IReportPublicationGateway,
    private readonly presenter: IReportPublicationPresenter,
  ) {}

  async report(request: ReportPublicationRequest) {
    await this.gateway.report(request);

    this.presenter.present(success());
  }
}
