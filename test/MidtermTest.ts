import { expect } from "chai";
import { network } from "hardhat";
import { parseEther } from "ethers";

interface Question {
  question: string;
  options: string[];
}

interface Answer {
  respondent: string;
  answers: number[];
}

describe("Survey init", () => {
  const title = "막무가내 설문조사라면";
  const description =
    "중앙화된 설문조사로서, 모든 데이터는 공개되지 않으며 설문조사를 게시한자만 볼 수 있습니다.";
  const questions: Question[] = [
    {
      question: "누가 내 응답을 관리할때 더 솔직할 수 있을까요?",
      options: [
        "구글폼 운영자",
        "탈중앙화된 블록체인 (관리주체 없으며 모든 데이터 공개)",
        "상관없음",
      ],
    },
  ];

  const getSurveyContractAndEthers = async (survey: {
    title: string;
    description: string;
    targetNumber: number;
    questions: Question[];
  }) => {
    const { ethers } = await network.connect();
    const [owner, respondent1, respondent2, respondent3] = await ethers.getSigners();

    const cSurvey = await ethers.deployContract(
      "Survey",
      [survey.title, survey.description, survey.targetNumber, survey.questions],
      { value: parseEther("1") } 
    );
    await cSurvey.waitForDeployment();

    return { ethers, cSurvey, owner, respondent1, respondent2, respondent3 };
  };

  describe("Deployment", () => {
    it("should store survey info correctly", async () => {
      const { cSurvey } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber: 3,
        questions,
      });

      expect(await cSurvey.title()).to.equal(title);
      expect(await cSurvey.description()).to.equal(description);
      expect(await cSurvey.targetNumber()).to.equal(3);

      const onchainQs = await cSurvey.getQuestion();
      expect(onchainQs.length).to.equal(questions.length);
      expect(onchainQs[0].question).to.equal(questions[0].question);
      expect(onchainQs[0].options).to.deep.equal(questions[0].options);
    });

    it("should calculate rewardAmount correctly", async () => {
      const targetNumber = 5;
      const pool = parseEther("1");
      const { ethers } = await network.connect();
      const [owner] = await ethers.getSigners();

      const cSurvey = await ethers.deployContract(
        "Survey",
        [title, description, targetNumber, questions],
        { value: pool }
      );
      await cSurvey.waitForDeployment();

      const reward = await cSurvey.rewardAmount();
      expect(reward).to.equal(pool / BigInt(targetNumber));
    });
  });


  describe("Questions and Answers", () => {
    it("should return questions correctly", async () => {
      const { cSurvey } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber: 3,
        questions,
      });

      const onchainQs = await cSurvey.getQuestion();
      expect(onchainQs.length).to.equal(1);
      expect(onchainQs[0].question).to.equal(questions[0].question);
      expect(onchainQs[0].options).to.deep.equal(questions[0].options);
    });

    it("should allow valid answer submission", async () => {
      const { cSurvey, respondent1 } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber: 3,
        questions,
      });

      await cSurvey.connect(respondent1).submitAnswer({
        respondent: await respondent1.getAddress(),
        answers: [1], // 첫 번째(유일) 질문에 대한 선택지 인덱스
      });

      const allAnswers = await cSurvey.getAnswers();
      expect(allAnswers.length).to.equal(1);
      expect(allAnswers[0].respondent).to.equal(await respondent1.getAddress());
      // uint8[] -> bigint[] 로 오기 때문에 숫자로 맞춰 비교
      expect(allAnswers[0].answers.map((x: bigint) => Number(x))).to.deep.equal([1]);
    });

    it("should revert if answer length mismatch", async () => {
      const { cSurvey, respondent1 } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber: 3,
        questions,
      });

      await expect(
        cSurvey.connect(respondent1).submitAnswer({
          respondent: await respondent1.getAddress(),
          answers: [0, 1], 
        })
      ).to.be.revertedWith("Mismatched answers length");
    });

    it("should revert if target reached", async () => {
      const { cSurvey, respondent1, respondent2, respondent3 } =
        await getSurveyContractAndEthers({
          title,
          description,
          targetNumber: 2,
          questions,
        });

      await cSurvey.connect(respondent1).submitAnswer({
        respondent: await respondent1.getAddress(),
        answers: [0],
      });
      await cSurvey.connect(respondent2).submitAnswer({
        respondent: await respondent2.getAddress(),
        answers: [1],
      });

      await expect(
        cSurvey.connect(respondent3).submitAnswer({
          respondent: await respondent3.getAddress(),
          answers: [2],
        })
      ).to.be.revertedWith("This survey has been ended");
    });
  });

 
  describe("Rewards", () => {
    it("should pay correct reward to respondent", async () => {
      const targetNumber = 3;
      const pool = parseEther("1");

      const { ethers } = await network.connect();
      const [owner, respondent] = await ethers.getSigners();

      const cSurvey = await ethers.deployContract(
        "Survey",
        [title, description, targetNumber, questions],
        { value: pool }
      );
      await cSurvey.waitForDeployment();

      const reward = await cSurvey.rewardAmount();

      // 컨트랙트 잔고 감소로 보상 검증 (사용자 잔고는 가스 때문에 불안정)
      const beforeContractBal = await ethers.provider.getBalance(
        await cSurvey.getAddress()
      );

      await cSurvey.connect(respondent).submitAnswer({
        respondent: await respondent.getAddress(),
        answers: [0],
      });

      const afterContractBal = await ethers.provider.getBalance(
        await cSurvey.getAddress()
      );

      expect(beforeContractBal - afterContractBal).to.equal(reward);

      const all = await cSurvey.getAnswers();
      expect(all.length).to.equal(1);
      expect(all[0].respondent).to.equal(await respondent.getAddress());
    });
  });
});
