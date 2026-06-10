import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "ethers";

export default buildModule("SurveyFactoryModule", (m) => {
  const surveyFactory = m.contract("SurveyFactory", [
    ethers.parseEther("1"),
    ethers.parseEther("0.02"),
  ]);
  return { surveyFactory };
});
