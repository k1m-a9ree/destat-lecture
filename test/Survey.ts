import { expect } from "chai";
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

    const s = await ethers.deployContract("Survey", [title, description, questions]);

    const _title = await s.title();
    const _description = await s.description();
    const _questions = (await s.getQuestions()) as Question[];

    expect(_title).eq(title);
    expect(_description).eq(description);
    expect(_questions[0].options).deep.eq(questions[0].options);
})