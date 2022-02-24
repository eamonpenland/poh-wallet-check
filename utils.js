import {
  callReadOnlyFunction,
  cvToJSON,
  cvToValue,
  standardPrincipalCV,
  uintCV,
} from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";

export const STACKS_NETWORK = new StacksMainnet();

STACKS_NETWORK.coreApiUrl = "https://stacks-node-api.stacks.co";

export async function getBlockHeight() {
  const url = `${STACKS_NETWORK.coreApiUrl}/v2/info`;
  const result = await fetch(url);
  const resultJson = await result.json();
  return resultJson.stacks_tip_height;
}

export async function getRewardCycle(
  contractAddress,
  contractName,
  blockHeight
) {
  const resultCv = await callReadOnlyFunction({
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: "get-reward-cycle",
    functionArgs: [uintCV(blockHeight)],
    network: STACKS_NETWORK,
    senderAddress: contractAddress,
  });
  const result = cvToJSON(resultCv);
  return parseInt(result.value.value);
}

export async function getUserId(contractAddress, contractName, address) {
  const resultCv = await callReadOnlyFunction({
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: "get-user-id",
    functionArgs: [standardPrincipalCV(address)],
    network: STACKS_NETWORK,
    senderAddress: contractAddress,
  });
  const result = cvToValue(resultCv);
  return parseInt(result.value);
}

export async function getStackerAtCycleOrDefault(
  contractAddress,
  contractName,
  cycleId,
  userId
) {
  const resultCv = await callReadOnlyFunction({
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: "get-stacker-at-cycle-or-default",
    functionArgs: [uintCV(cycleId), uintCV(userId)],
    network: STACKS_NETWORK,
    senderAddress: contractAddress,
  });
  const result = cvToJSON(resultCv);
  return result;
}

export async function getStacked(contractAddress, contractName, wallet) {
  const [blockHeight, userId] = await Promise.all([
    getBlockHeight(),
    getUserId(contractAddress, contractName, wallet),
  ]);
  const rewardCycle = await getRewardCycle(
    contractAddress,
    contractName,
    blockHeight
  );

  const stacked = await getStackerAtCycleOrDefault(
    contractAddress,
    contractName,
    rewardCycle,
    userId
  );

  return Number(stacked?.value?.amountStacked?.value);
}

export async function getStxBalance(address) {
  const url = `${STACKS_NETWORK.coreApiUrl}/extended/v1/address/${address}/balances`;
  const result = await fetch(url);
  const resultJson = await result.json();
  return resultJson;
}
