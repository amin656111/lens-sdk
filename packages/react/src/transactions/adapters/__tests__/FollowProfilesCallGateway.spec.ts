import { MockedResponse } from '@apollo/client/testing';
import {
  CreateFollowTypedDataDocument,
  CreateFollowTypedDataData,
  CreateFollowTypedDataVariables,
  omitTypename,
} from '@lens-protocol/api-bindings';
import {
  mockCreateFollowTypedDataData,
  createMockApolloClientWithMultipleResponses,
} from '@lens-protocol/api-bindings/mocks';
import {
  mockNonce,
  mockPaidFollowRequest,
  mockProfileOwnerFollowRequest,
  mockUnconstrainedFollowRequest,
} from '@lens-protocol/domain/mocks';

import { UnsignedLensProtocolCall } from '../../../wallet/adapters/ConcreteWallet';
import { FollowProfilesCallGateway } from '../FollowProfilesCallGateway';

function createCreateFollowTypedDataMutationMockedResponse({
  variables,
  data,
}: {
  variables: CreateFollowTypedDataVariables;
  data: CreateFollowTypedDataData;
}): MockedResponse<CreateFollowTypedDataData> {
  return {
    request: {
      query: CreateFollowTypedDataDocument,
      variables,
    },
    result: {
      data,
    },
  };
}

describe(`Given an instance of the ${FollowProfilesCallGateway.name}`, () => {
  describe(`when calling the "${FollowProfilesCallGateway.prototype.createUnsignedProtocolCall.name}" method`, () => {
    describe('with an UnconstrainedFollowRequest', () => {
      it(`should create an "${UnsignedLensProtocolCall.name}" w/ the expected typed data`, async () => {
        const request = mockUnconstrainedFollowRequest();
        const data = mockCreateFollowTypedDataData();

        const apollo = createMockApolloClientWithMultipleResponses([
          createCreateFollowTypedDataMutationMockedResponse({
            variables: {
              request: {
                follow: [
                  {
                    profile: request.profileId,
                  },
                ],
              },
            },
            data,
          }),
        ]);
        const followFeeTransactionGateway = new FollowProfilesCallGateway(apollo);

        const unsignedCall = await followFeeTransactionGateway.createUnsignedProtocolCall(request);

        expect(unsignedCall).toBeInstanceOf(UnsignedLensProtocolCall);
        expect(unsignedCall.typedData).toEqual(omitTypename(data.result.typedData));
      });
    });

    describe('with a ProfileOwnerFollowRequest', () => {
      it(`should create an "${UnsignedLensProtocolCall.name}" w/ the expected typed data`, async () => {
        const request = mockProfileOwnerFollowRequest();
        const data = mockCreateFollowTypedDataData();

        const apollo = createMockApolloClientWithMultipleResponses([
          createCreateFollowTypedDataMutationMockedResponse({
            variables: {
              request: {
                follow: [
                  {
                    profile: request.profileId,
                    followModule: {
                      profileFollowModule: {
                        profileId: request.followerProfileId,
                      },
                    },
                  },
                ],
              },
            },
            data,
          }),
        ]);
        const followFeeTransactionGateway = new FollowProfilesCallGateway(apollo);

        const unsignedCall = await followFeeTransactionGateway.createUnsignedProtocolCall(request);

        expect(unsignedCall).toBeInstanceOf(UnsignedLensProtocolCall);
        expect(unsignedCall.typedData).toEqual(omitTypename(data.result.typedData));
      });
    });

    describe(`with a PaidFollowRequest`, () => {
      it(`should create an "${UnsignedLensProtocolCall.name}" w/ the expected typed data`, async () => {
        const request = mockPaidFollowRequest();
        const data = mockCreateFollowTypedDataData();

        const apollo = createMockApolloClientWithMultipleResponses([
          createCreateFollowTypedDataMutationMockedResponse({
            variables: {
              request: {
                follow: [
                  {
                    profile: request.profileId,
                    followModule: {
                      feeFollowModule: {
                        amount: {
                          currency: request.fee.amount.asset.address,
                          value: request.fee.amount.toFixed(),
                        },
                      },
                    },
                  },
                ],
              },
            },
            data,
          }),
        ]);
        const followProfilesCallGateway = new FollowProfilesCallGateway(apollo);

        const unsignedCall = await followProfilesCallGateway.createUnsignedProtocolCall(request);

        expect(unsignedCall).toBeInstanceOf(UnsignedLensProtocolCall);
        expect(unsignedCall.typedData).toEqual(omitTypename(data.result.typedData));
      });
    });

    it(`should be possible to override the signature nonce`, async () => {
      const request = mockUnconstrainedFollowRequest();
      const nonce = mockNonce();
      const apollo = createMockApolloClientWithMultipleResponses([
        createCreateFollowTypedDataMutationMockedResponse({
          variables: {
            request: {
              follow: [
                {
                  profile: request.profileId,
                },
              ],
            },
            options: {
              overrideSigNonce: nonce,
            },
          },
          data: mockCreateFollowTypedDataData({ nonce }),
        }),
      ]);
      const followFeeTransactionGateway = new FollowProfilesCallGateway(apollo);

      const unsignedCall = await followFeeTransactionGateway.createUnsignedProtocolCall(
        request,
        nonce,
      );

      expect(unsignedCall.nonce).toEqual(nonce);
    });
  });
});
