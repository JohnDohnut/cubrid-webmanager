const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = require('docx');
const { marked } = require('marked');

// Markdown 파일 읽기
const markdownFile = path.join(__dirname, 'BACKEND_ARCHITECTURE_FOR_QA.md');
const markdownContent = fs.readFileSync(markdownFile, 'utf-8');

// Markdown을 파싱
const tokens = marked.lexer(markdownContent);

// DOCX 문서 생성
const children = [];

function escapeText(text) {
    if (!text) return '';
    if (typeof text !== 'string') return String(text);
    // 링크 제거: [text](url) -> text
    return text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
}

function processTokens(tokens) {
    for (const token of tokens) {
        switch (token.type) {
            case 'heading':
                const headingLevel = Math.min(token.depth, 6);
                children.push(
                    new Paragraph({
                        text: escapeText(token.text),
                        heading: HeadingLevel[`HEADING_${headingLevel}`],
                        spacing: { after: 200 },
                    })
                );
                break;
            
            case 'paragraph':
                const text = escapeText(token.text);
                if (text.trim()) {
                    children.push(
                        new Paragraph({
                            text: text,
                            spacing: { after: 100 },
                        })
                    );
                }
                break;
            
            case 'code':
                children.push(
                    new Paragraph({
                        text: escapeText(token.text),
                        spacing: { after: 100 },
                    })
                );
                break;
            
            case 'list':
                token.items.forEach(item => {
                    const itemText = escapeText(item.text);
                    children.push(
                        new Paragraph({
                            text: `• ${itemText}`,
                            spacing: { after: 50 },
                            indent: { left: 400 },
                        })
                    );
                });
                break;
            
            case 'table':
                // 헤더 행
                if (token.header && token.header.length > 0) {
                    const headerCells = token.header.map(cell => {
                        const cellText = Array.isArray(cell) ? cell.map(c => escapeText(c)).join(' ') : escapeText(cell);
                        return new TableCell({
                            children: [new Paragraph({
                                text: cellText,
                                heading: HeadingLevel.HEADING_3,
                            })],
                            width: { size: 100 / token.header.length, type: WidthType.PERCENTAGE },
                        });
                    });
                    children.push(
                        new Table({
                            rows: [
                                new TableRow({ children: headerCells }),
                                ...token.rows.map(row => {
                                    const cells = row.map(cell => {
                                        const cellText = Array.isArray(cell) ? cell.map(c => escapeText(c)).join(' ') : escapeText(cell);
                                        return new TableCell({
                                            children: [new Paragraph({
                                                text: cellText,
                                            })],
                                            width: { size: 100 / row.length, type: WidthType.PERCENTAGE },
                                        });
                                    });
                                    return new TableRow({ children: cells });
                                })
                            ],
                            width: { size: 100, type: WidthType.PERCENTAGE },
                        })
                    );
                    children.push(new Paragraph({ text: '' })); // 테이블 후 공백
                }
                break;
            
            case 'hr':
                children.push(new Paragraph({ text: '─'.repeat(50) }));
                break;
        }
    }
}

processTokens(tokens);

const doc = new Document({
    sections: [{
        children: children,
    }],
});

// DOCX 파일로 저장
Packer.toBuffer(doc).then(buffer => {
    const outputFile = path.join(__dirname, 'BACKEND_ARCHITECTURE_FOR_QA.docx');
    fs.writeFileSync(outputFile, buffer);
    console.log(`✅ 변환 완료: ${outputFile}`);
    console.log(`파일 크기: ${(buffer.length / 1024).toFixed(2)} KB`);
}).catch(err => {
    console.error('❌ 변환 실패:', err.message);
    console.log('\n대안 방법:');
    console.log('1. pandoc 설치: https://pandoc.org/installing.html');
    console.log('2. 설치 후: pandoc BACKEND_ARCHITECTURE_FOR_QA.md -o BACKEND_ARCHITECTURE_FOR_QA.docx');
    console.log('3. 또는 온라인 변환: https://cloudconvert.com/md-to-docx');
});
