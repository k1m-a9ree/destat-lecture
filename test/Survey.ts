import { expect } from "chai";
import { keccak256 } from "ethers";
import { network } from "hardhat";

interface Question {
    question: string;
    options: string[];
}
it("Servey init", async () => {
    const { ethers } = await network.connect();
    const title = "막무가내 설문조사";
    const description = "중앙화된 설문조사로서, 모든 데이터는 공개되지 않으며 설문조사를 게시한 자만 볼 수 있습니다.";
    const questions: Question[] = [
        {
            question: "누가 내 응답을 관리할 때 더 솔직할 수 있을까요?",
            options: ["구글 폼 운영자", "탈중앙화된 블록체인 (관리주체 없으며 모든 데이터 공개)", "상관 없음"]
        }
    ]

    const survey = await ethers.deployContract(
        "Survey", 
        [ title, description, questions, 100 ], 
        { value: ethers.parseEther('100') }
    );
    
    console.log(await survey.getQuestions());

    const slot0Data = await ethers.provider.getStorage(survey.getAddress(), ethers.toBeHex(0, 32))
    const slot1Data = await ethers.provider.getStorage(survey.getAddress(), ethers.toBeHex(1, 32))
    const slot2Data = await ethers.provider.getStorage(survey.getAddress(), ethers.toBeHex(2, 32))
    const slot3Data = await ethers.provider.getStorage(survey.getAddress(), ethers.toBeHex(3, 32))
    const slot4Data = await ethers.provider.getStorage(survey.getAddress(), ethers.toBeHex(4, 32))
    const slot5Data = await ethers.provider.getStorage(survey.getAddress(), ethers.toBeHex(5, 32))

    const decodeUni = (hex: string) => Buffer.from(hex.slice(2), 'hex').toString('utf-8');
    console.log(slot0Data);
    console.log(slot1Data);
    console.log(slot2Data);
    console.log(slot3Data);
    console.log(slot4Data);
    console.log(slot5Data);

    const pDesc = keccak256(ethers.toBeHex(1, 32))
    const desc = await ethers.provider.getStorage(await survey.getAddress(), pDesc);
    console.log(desc);
});

// describe("SurveyFactory Contract", () => {
//     let factory: any, owner, respondent1, respondent2, ethers: any;

//     beforeEach(async () => {
//         const networkConnect = await network.connect();
//         ethers = networkConnect.ethers;
//         [owner, respondent1, respondent2] = await ethers.getSigners();

//         factory = await ethers.deployContract("SurveyFactory", [
//             ethers.parseEther("50"), // min_pool_amount
//             ethers.parseEther("0.1"), // min_reward_amount
//         ]);
//     });

//     it("should deploy with correct minimum amounts", async () => {
//         // TODO: check min_pool_amount and min_reward_amount
//         const badPoolTx = factory.createSurvey({
//             title,
//             description,
//             questions,
//             targetNumber: 100
//         }, {
//             value: ethers.parseEther('40') // 50 ETH 미만
//         });

//         await expect(badPoolTx).to.be.revertedWith('Insufficient pool amount');

//         const badRewardTx = factory.createSurvey({
//             title,
//             description,
//             questions,
//             targetNumber: 1000 // 타겟 인원을 1000명으로 뻥튀기
//         }, {
//             value: ethers.parseEther('99') // 100 하면, 0.1 eth >= 100 / 1000 eth 이라서 돈이 안부족함 -> reverted 안떠서 패스 실패
//         });

//         await expect(badRewardTx).to.be.revertedWith('Insufficient reward amount');
//     });

//     it("should create a new survey when valid values are provided", async () => {
//         // TODO: prepare SurveySchema and call createSurvey with msg.value
//         // TODO: check event SurveyCreated emitted
//         // TODO: check surveys array length increased
//     });

//     it("should revert if pool amount is too small", async () => {
//         // TODO: expect revert when msg.value < min_pool_amount
//     });

//     it("should revert if reward amount per respondent is too small", async () => {
//         // TODO: expect revert when msg.value / targetNumber < min_reward_amount
//     });

//     it("should store created surveys and return them from getSurveys", async () => {
//         // TODO: create multiple surveys and check getSurveys output
//     });
// });