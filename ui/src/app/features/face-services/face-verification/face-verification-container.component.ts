/*
 * Copyright (c) 2020 the original author or authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AVAILABLE_IMAGE_EXTENSIONS, MAX_IMAGE_SIZE } from 'src/app/core/constants';

import { AppState } from '../../../store';
import { verifyFaceReset, verifyFace } from '../../../store/face-verification/action';
import {
  selectCheckFile,
  selectFaceData,
  selectProcessFile,
  selectRequest,
  selectStateReady,
  selectTestIsPending,
} from '../../../store/face-verification/selectors';
import { getFileExtension } from '../face-services.helpers';
import { SnackBarService } from '../../snackbar/snackbar.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-face-verification-container',
  templateUrl: './face-verification-container.component.html',
  styleUrls: ['./face-verification-container.component.scss'],
})
export class FaceVerificationContainerComponent implements OnInit, OnDestroy {
  processFile$: Observable<any>;
  checkFile$: Observable<any>;
  data$: Observable<any>;
  requestInfo$: Observable<any>;
  pending$: Observable<boolean>;
  isLoaded$: Observable<boolean>;

  constructor(private store: Store<AppState>, private snackBarService: SnackBarService) {}

  ngOnInit() {
    this.processFile$ = this.store.select(selectProcessFile).pipe(map(obj => obj.processFile));
    this.checkFile$ = this.store.select(selectCheckFile).pipe(map(obj => obj.checkFile));
    this.data$ = this.store.select(selectFaceData);
    this.requestInfo$ = this.store.select(selectRequest);
    this.pending$ = this.store.select(selectTestIsPending);
    this.isLoaded$ = this.store.select(selectStateReady);
  }

  ngOnDestroy() {
    this.store.dispatch(verifyFaceReset());
  }

  processFileUpload(file) {
    if (this.validateImage(file)) {
      this.store.dispatch(verifyFace({ processFile: file }));
    }
  }

  checkFileUpload(file) {
    if (this.validateImage(file)) {
      this.store.dispatch(verifyFace({ checkFile: file }));
    }
  }

  validateImage(file) {
    if (!AVAILABLE_IMAGE_EXTENSIONS.includes(getFileExtension(file))) {
      this.snackBarService.openNotification({
        messageText: 'face_recognition_container.file_unavailable_extension',
        messageOptions: { filename: file.name },
        type: 'error',
      });
      return false;
    } else if (file.size > MAX_IMAGE_SIZE) {
      this.snackBarService.openNotification({ messageText: 'face_recognition_container.file_size_error', type: 'error' });
      return false;
    } else {
      return true;
    }
  }
}
