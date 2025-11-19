/**
 * 脚本模块整合 - 所有脚本的入口文件
 */

import { coreScript } from './core';
import { mediaScript } from './media';
import { navigationScript } from './navigation';
import { modesScript } from './modes';
import { commentsScript } from './comments';
import { relatedQuestionsScript } from './related-questions';
import { utilsScript } from './utils';
import { keyboardScript } from './keyboard';
import { styleScript } from './style';
import { toolbarScript } from './toolbar';
import { shortcutsScript } from './shortcuts';
import { questionDetailScript } from './question-detail';
import { authorScript } from './author';
import { answerSortScript } from './answer-sort';
import { exportScript } from './export';

/**
 * 完整的脚本模板 - 拼接所有功能模块
 */
export const scriptsTemplate = `
${coreScript}

${mediaScript}

${navigationScript}

${modesScript}

${commentsScript}

${relatedQuestionsScript}

${utilsScript}

${keyboardScript}

${styleScript}

${toolbarScript}

${shortcutsScript}

${questionDetailScript}

${authorScript}

${answerSortScript}

${exportScript}
`;
