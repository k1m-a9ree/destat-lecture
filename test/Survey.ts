import { expect } from "chai";
import { network } from "hardhat";

interface Question {
    question: string;
    options: string[];
}
// it("Servey init", async () => {
//     const { ethers } = await network.connect();
//     const title = "막무가내 설문조사";
//     const description = "중앙화된 설문조사로서, 모든 데이터는 공개되지 않으며 설문조사를 게시한 자만 볼 수 있습니다.";
//     const questions: Question[] = [
//         {
//             question: "누가 내 응답을 관리할 때 더 솔직할 수 있을까요?",
//             options: ["구글 폼 운영자", "탈중앙화된 블록체인 (관리주체 없으며 모든 데이터 공개)", "상관 없음"]
//         }
//     ]

//     const factory = await ethers.deployContract('SurveyFactory', [
//         ethers.parseEther('50'),
//         ethers.parseEther('0.1')
//     ]);
//     const tx = await factory.createSurvey({
//         title,
//         description,
//         questions,
//         targetNumber: 100
//     }, {
//         value: ethers.parseEther('100')
//     });
//     const receipt = await tx.wait();
//     let surveyAddress;
//     receipt?.logs.forEach(log => {
//         const event = factory.interface.parseLog(log);
//         if (event?.name == 'SurveyCreated') {
//             surveyAddress = event.args[0];
//         }
//     })

//     // const surveys = await factory.getSurveys();

//     // const survey =  await ethers.deployContract('Survey', [title, description, ...])
//     const surveyC = await ethers.getContractFactory('Survey');
//     const signers = await ethers.getSigners();
//     const respondent = signers[0]
//     if (surveyAddress) {
//         const survey = await surveyC.attach(surveyAddress);
//         await survey.connect(respondent);
//         console.log(ethers.formatEther(await ethers.provider.getBalance(respondent)));
//         const submitTx = await survey.submitAnswer({
//             respondent,
//             answers: [1]
//         });
//         await submitTx.wait();
//         console.log(ethers.formatEther(await ethers.provider.getBalance(respondent)));
//     }

// })

describe("SurveyFactory Contract", () => {
    let factory: any, owner, respondent1, respondent2;

    beforeEach(async () => {
        const { ethers } = await network.connect();
        [owner, respondent1, respondent2] = await ethers.getSigners();

        factory = await ethers.deployContract("SurveyFactory", [
            ethers.parseEther("50"), // min_pool_amount
            ethers.parseEther("0.1"), // min_reward_amount
        ]);
    });

    it("should deploy with correct minimum amounts", async () => {
        // TODO: check min_pool_amount and min_reward_amount
        const poolAmount = await ethers.provider.getStorage(factory.target, 0);
        const rewardAmount = await ethers.provider.getStorage(factory.target, 1);

        expect(BigInt(poolAmount)).to.equal(ethers.parseEther("50"));
        expect(BigInt(rewardAmount)).to.equal(ethers.parseEther("0.1"));
    });

    it("should create a new survey when valid values are provided", async () => {
        // TODO: prepare SurveySchema and call createSurvey with msg.value
        const surveyData = {
            title: "Valid Survey",
            description: "This is a test survey",
            targetNumber: 100,
            questions: [{ question: "Test Q", options: ["A", "B"] }]
        };
        // TODO: check event SurveyCreated emitted
        await expect(factory.createSurvey(surveyData, { value: ethers.parseEther("50") }))
            .to.emit(factory, "SurveyCreated");
        // TODO: check surveys array length increased
        const surveys = await factory.getSurveys();
        expect(surveys.length).to.equal(1);
    });

    it("should revert if pool amount is too small", async () => {
        // TODO: expect revert when msg.value < min_pool_amount
        const surveyData = {
            title: "Small Pool Survey",
            description: "This is a test survey",
            targetNumber: 100,
            questions: [{ question: "Test Q", options: ["A", "B"] }]
        };

        // 50 이더 미만(49 이더) 전송 시 revert 기대
        await expect(
            factory.createSurvey(surveyData, { value: ethers.parseEther("49") })
        ).to.be.revertedWith("insufficient pool amount");
    });

    it("should revert if reward amount per respondent is too small", async () => {
        // TODO: expect revert when msg.value / targetNumber < min_reward_amount
        const surveyData = {
            title: "Small Reward Survey",
            description: "This is a test survey",
            targetNumber: 1000, // 50 / 1000 = 0.05 (0.1 미만)
            questions: [{ question: "Test Q", options: ["A", "B"] }]
        };

        // 보상금액 미달 조건 충족 시 revert 기대
        await expect(
            factory.createSurvey(surveyData, { value: ethers.parseEther("50") })
        ).to.be.revertedWith("Insufficient reward amount");
    });

    it("should store created surveys and return them from getSurveys", async () => {
        // TODO: create multiple surveys and check getSurveys output
        const surveyData1 = { title: "Survey 1", description: "Desc 1", targetNumber: 100, questions: [] };
        const surveyData2 = { title: "Survey 2", description: "Desc 2", targetNumber: 100, questions: [] };
        const value = ethers.parseEther("50");

        await factory.createSurvey(surveyData1, { value });
        await factory.createSurvey(surveyData2, { value });

        const surveys = await factory.getSurveys();
        expect(surveys.length).to.equal(2);
    });
});