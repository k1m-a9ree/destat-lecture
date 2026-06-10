import { expect } from "chai";
import { network } from "hardhat";
import type { SurveyFactory, SurveySchemaStructOutput } from "../types/ethers-contracts/SurveyFactory.js";
import type { Survey } from "../types/ethers-contracts/Survey.js";
import { title } from "process";
import { LogDescription } from "ethers";
// import type

interface Question {
    question: string;
    options: string[]; // do not store field name
}

describe("SurveyFactory Contract", () => {

let factory : SurveyFactory;
//let survey : Survey[];
let owner, respondent1, respondent2;
  
  beforeEach(async () => {
    const { ethers } = await network.connect();

    [owner, respondent1, respondent2] = await ethers.getSigners();



    factory = await ethers.deployContract("SurveyFactory", [

      ethers.parseEther("50"), // min_pool_amount

      ethers.parseEther("0.1"), // min_reward_amount

    ]);
    
  });



  it("should deploy with correct minimum amounts", async () => {
    const { ethers } = await network.connect();

    // TODO: check min_pool_amount and min_reward_amount
    expect(await factory.min_pool_amount()).equal(ethers.parseEther("50"));
    expect(await factory.min_reward_amount()).equal(ethers.parseEther("0.1"));
  });



  it("should create a new survey when valid values are provided", async () => {
    const { ethers } = await network.connect();

    // TODO: prepare SurveySchema and call createSurvey with msg.value
    const title = "막무가내 설문조사";
    const description = "탈중앙설문조사";
    const questions: Question[] = [
        {question: "누가 내 응답을 관리할때 더 솔직할 수 있을까요?",
            options: [
                "구글폼 운영자","탈중앙화된 블록체인(관리주체 없으며 모든 데이터 공개)","상관 없음"
            ]
        }
    ];
    
    // TODO: check event SurveyCreated emitted
    await expect(factory.createSurvey({
        title,
        description,
        targetNumber: 100,
        questions,
    },{
        value: ethers.parseEther("100"),
    })).to.emit(factory, "SurveyCreated");
    
    // TODO: check surveys array length increased
    expect((await factory.getSurveys()).length).equal(1);

  });



  it("should revert if pool amount is too small", async () => {

    const { ethers } = await network.connect();
    // TODO: expect revert when msg.value < min_pool_amount 
    const title = "막무가내 설문조사";
    const description = "탈중앙설문조사";
    const questions: Question[] = [
        {question: "누가 내 응답을 관리할때 더 솔직할 수 있을까요?",
            options: [
                "구글폼 운영자","탈중앙화된 블록체인(관리주체 없으며 모든 데이터 공개)","상관 없음"
            ]
        }
    ];
    
    await expect(factory.createSurvey({
        title,
        description,
        targetNumber: 100,
        questions,
    },{
        value: ethers.parseEther("49"),
    })).to.be.revertedWith("Insufficient pool amount");
    // event, revert -> await expect
  });



  it("should revert if reward amount per respondent is too small", async () => {

    const { ethers } = await network.connect();
    // TODO: expect revert when msg.value / targetNumber < min_reward_amount
    const title = "막무가내 설문조사";
    const description = "탈중앙설문조사";
    const questions: Question[] = [
        {question: "누가 내 응답을 관리할때 더 솔직할 수 있을까요?",
            options: [
                "구글폼 운영자","탈중앙화된 블록체인(관리주체 없으며 모든 데이터 공개)","상관 없음"
            ]
        }
    ];
    await expect(factory.createSurvey({
        title,
        description,
        targetNumber: 1001,
        questions,
    },{
        value: ethers.parseEther("100"),
    })).to.revertedWith("Insufficient reward amount");
  });



  it("should store created surveys and return them from getSurveys", async () => {
    const {ethers} = await network.connect();
    // TODO: create multiple surveys and check getSurveys output
    let factory: SurveyFactory;
    factory = await ethers.deployContract("SurveyFactory", [
        ethers.parseEther("50"),
       ethers.parseEther("0.1"),
    ]);
    for(var i = 0; i < 5; i++){

    const title = "막무가내 설문조사"+i;
    const description = "탈중앙설문조사";
    const questions: Question[] = [
        {question: "누가 내 응답을 관리할때 더 솔직할 수 있을까요?",
            options: [
                "구글폼 운영자","탈중앙화된 블록체인(관리주체 없으며 모든 데이터 공개)","상관 없음"
            ]
        }
    ];
    
    await factory.createSurvey({
        title,
        description,
        targetNumber: 100,
        questions,
    },{
        value: ethers.parseEther("100"),
    });
     
}   
    let surveys;
    surveys = await factory.getSurveys();
    for(var i = 0; i<5; i++){
        const surveyC = await ethers.getContractFactory("Survey");
        const survey = await surveyC.attach(surveys[i]);
        expect(await survey.title()).equals("막무가내 설문조사"+i);
    }
  });

});